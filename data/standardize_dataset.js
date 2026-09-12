/**
 * Medical Knowledge Graph — Phase 2
 * Medical Dataset Standardization Agent
 *
 * Converts validated disease JSON files into ONE canonical schema.
 * NEVER adds/removes diseases or symptoms.
 * NEVER changes medical meaning.
 * ONLY standardizes representation.
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────
// Canonical enum maps
// ─────────────────────────────────────────────

const SEVERITY_MAP = {
  mild: "mild",
  moderate: "moderate",
  severe: "severe",
  unknown: "unknown",
  // Compound / non-standard → closest canonical
  mild_to_moderate: "moderate",
  moderate_to_high: "moderate",
  moderate_to_severe: "severe",
  life_threatening: "severe",
};

const ONSET_MAP = {
  prodrome: "prodrome",
  early: "early",
  peak: "peak",
  late: "late",
  complication: "complication",
  unknown: "unknown",
  // Non-standard → canonical
  acute: "early",
  episodic: "unknown",
  progressive: "late",
  advanced: "late",
  chronic: "late",
  early_to_mid: "early",
  mid: "peak",
  mid_to_late: "late",
};

const ORGAN_SYSTEM_MAP = {
  constitutional: "constitutional",
  respiratory: "respiratory",
  cardiovascular: "cardiovascular",
  gastrointestinal: "gastrointestinal",
  neurological: "neurological",
  musculoskeletal: "musculoskeletal",
  dermatological: "dermatological",
  genitourinary: "genitourinary",
  psychiatric: "psychiatric",
  ophthalmological: "ophthalmological",
  hematological: "hematological",
  endocrine: "endocrine",
  multisystem: "multisystem",
  other: "other",
  // Non-standard → canonical
  systemic: "multisystem",
  ent: "respiratory",
  ENT: "respiratory",
  vascular: "cardiovascular",
  oral: "gastrointestinal",
  lymphatic: "hematological",
};

const EVIDENCE_SOURCE_MAP = {
  "MSD Manual Professional Edition": "MSD Manual",
  "Merck Manual Professional Edition": "Merck Manual Professional",
  "MedlinePlus (NIH)": "MedlinePlus",
  "Johns Hopkins": "Johns Hopkins Medicine",
  "American Heart Association (AHA)": "American Heart Association",
};

// Evidence source prefix normalization: match known prefixes and map them
const EVIDENCE_PREFIX_MAP = [
  { prefix: "AHA", canonical: "American Heart Association" },
];

// ─────────────────────────────────────────────
// Canonical output file names per specialty
// ─────────────────────────────────────────────
const SPECIALTY_FILE_MAP = {
  "Infectious Diseases": "infectious_diseases.json",
  "Respiratory Diseases": "respiratory_diseases.json",
  Cardiology: "cardiology_diseases.json",
};

// ─────────────────────────────────────────────
// Tracking for the standardization report
// ─────────────────────────────────────────────
const report = {
  schema_version: "2.0.0",
  standardized_at: null,
  fields_renamed: [],
  enum_mappings: {
    severity: {},
    onset_stage: {},
    organ_system: {},
  },
  evidence_source_mappings: {},
  shared_diseases: [],
  files_produced: [],
  statistics: {
    total_diseases_processed: 0,
    total_symptoms_processed: 0,
    severity_remapped: 0,
    onset_remapped: 0,
    organ_system_remapped: 0,
    evidence_sources_normalized: 0,
    fields_renamed_count: 0,
    shared_diseases_count: 0,
  },
};

let fieldRenamedLogged = false; // only log the rename rule once

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function mapSeverity(raw) {
  if (!raw) return "unknown";
  const key = raw.toLowerCase().trim();
  if (SEVERITY_MAP[key] !== undefined) {
    const mapped = SEVERITY_MAP[key];
    if (key !== mapped) {
      report.statistics.severity_remapped++;
      report.enum_mappings.severity[raw] =
        (report.enum_mappings.severity[raw] || { to: mapped, count: 0 });
      report.enum_mappings.severity[raw].count++;
    }
    return mapped;
  }
  // Unknown value → unknown (safe fallback, never invent)
  report.statistics.severity_remapped++;
  report.enum_mappings.severity[raw] =
    (report.enum_mappings.severity[raw] || { to: "unknown", count: 0 });
  report.enum_mappings.severity[raw].count++;
  return "unknown";
}

function mapOnset(raw) {
  if (!raw) return "unknown";
  const key = raw.toLowerCase().trim();
  if (ONSET_MAP[key] !== undefined) {
    const mapped = ONSET_MAP[key];
    if (key !== mapped) {
      report.statistics.onset_remapped++;
      report.enum_mappings.onset_stage[raw] =
        (report.enum_mappings.onset_stage[raw] || { to: mapped, count: 0 });
      report.enum_mappings.onset_stage[raw].count++;
    }
    return mapped;
  }
  report.statistics.onset_remapped++;
  report.enum_mappings.onset_stage[raw] =
    (report.enum_mappings.onset_stage[raw] || { to: "unknown", count: 0 });
  report.enum_mappings.onset_stage[raw].count++;
  return "unknown";
}

function mapOrganSystem(raw) {
  if (!raw) return "other";
  const key = raw.toLowerCase().trim();
  // Try exact match first (case-insensitive)
  if (ORGAN_SYSTEM_MAP[key] !== undefined) {
    const mapped = ORGAN_SYSTEM_MAP[key];
    if (key !== mapped) {
      report.statistics.organ_system_remapped++;
      report.enum_mappings.organ_system[raw] =
        (report.enum_mappings.organ_system[raw] || { to: mapped, count: 0 });
      report.enum_mappings.organ_system[raw].count++;
    }
    return mapped;
  }
  // Also try original case for keys like "ENT"
  if (ORGAN_SYSTEM_MAP[raw] !== undefined) {
    const mapped = ORGAN_SYSTEM_MAP[raw];
    report.statistics.organ_system_remapped++;
    report.enum_mappings.organ_system[raw] =
      (report.enum_mappings.organ_system[raw] || { to: mapped, count: 0 });
    report.enum_mappings.organ_system[raw].count++;
    return mapped;
  }
  // Unknown → "other"
  report.statistics.organ_system_remapped++;
  report.enum_mappings.organ_system[raw] =
    (report.enum_mappings.organ_system[raw] || { to: "other", count: 0 });
  report.enum_mappings.organ_system[raw].count++;
  return "other";
}

function normalizeEvidenceSource(raw) {
  if (typeof raw !== "string") return raw;
  let normalized = raw.trim();

  // Check full-string replacements first
  if (EVIDENCE_SOURCE_MAP[normalized]) {
    const mapped = EVIDENCE_SOURCE_MAP[normalized];
    report.statistics.evidence_sources_normalized++;
    report.evidence_source_mappings[raw] =
      (report.evidence_source_mappings[raw] || { to: mapped, count: 0 });
    report.evidence_source_mappings[raw].count++;
    return mapped;
  }

  // Check prefix replacements (e.g. "AHA - Bradycardia" → "American Heart Association - Bradycardia")
  for (const { prefix, canonical } of EVIDENCE_PREFIX_MAP) {
    if (normalized.startsWith(prefix + " ") || normalized.startsWith(prefix + " -") || normalized === prefix) {
      const suffix = normalized.slice(prefix.length);
      const mapped = canonical + suffix;
      report.statistics.evidence_sources_normalized++;
      report.evidence_source_mappings[raw] =
        (report.evidence_source_mappings[raw] || { to: mapped, count: 0 });
      report.evidence_source_mappings[raw].count++;
      return mapped;
    }
  }

  return normalized;
}

/**
 * Standardize a single symptom object.
 * Renames symptom_name → symptom, maps enums.
 */
function standardizeSymptom(sym) {
  const standardized = {};

  // Field rename: symptom_name → symptom
  if (sym.symptom_name !== undefined && sym.symptom === undefined) {
    standardized.symptom = sym.symptom_name;
    if (!fieldRenamedLogged) {
      report.fields_renamed.push({
        from: "symptom_name",
        to: "symptom",
        scope: "symptom object",
      });
      fieldRenamedLogged = true;
    }
    report.statistics.fields_renamed_count++;
  } else if (sym.symptom !== undefined) {
    standardized.symptom = sym.symptom;
  }

  // Copy normalized_symptom as-is (do not change)
  standardized.normalized_symptom = sym.normalized_symptom || "";

  // Map enums
  standardized.frequency = sym.frequency; // already valid per Phase 1
  standardized.organ_system = mapOrganSystem(sym.organ_system);
  standardized.onset_stage = mapOnset(sym.onset_stage);
  standardized.severity = mapSeverity(sym.severity);

  // Evidence: normalize source names, preserve everything
  if (Array.isArray(sym.evidence_sources)) {
    standardized.evidence_sources = sym.evidence_sources.map(normalizeEvidenceSource);
  } else {
    standardized.evidence_sources = [];
  }
  standardized.evidence_count =
    typeof sym.evidence_count === "number"
      ? sym.evidence_count
      : standardized.evidence_sources.length;

  report.statistics.total_symptoms_processed++;
  return standardized;
}

/**
 * Standardize a single disease object.
 */
function standardizeDisease(disease, fileSpecialty) {
  const standardized = {
    disease_name: disease.disease_name,
    icd10_code: disease.icd10_code || "",
    description: disease.description || "",
    specialty: disease.specialty || fileSpecialty,
    symptoms: [],
  };

  // Copy optional fields that exist in the data
  if (disease.pathogen !== undefined) standardized.pathogen = disease.pathogen;
  if (disease.etiology !== undefined) standardized.etiology = disease.etiology;
  if (disease.transmission !== undefined) standardized.transmission = disease.transmission;
  if (disease.incubation_period !== undefined) standardized.incubation_period = disease.incubation_period;
  if (disease.risk_factors !== undefined) standardized.risk_factors = disease.risk_factors;

  // Standardize symptoms
  if (Array.isArray(disease.symptoms)) {
    standardized.symptoms = disease.symptoms.map(standardizeSymptom);
  }

  report.statistics.total_diseases_processed++;
  return standardized;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

function main() {
  const dataDir = __dirname;
  const outDir = path.join(dataDir, "standardized_data");

  // Create output directory
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Read input files
  const inputFiles = fs
    .readdirSync(dataDir)
    .filter(
      (f) =>
        f.endsWith(".json") &&
        f !== "validation_report.json" &&
        f !== "standardization_report.json" &&
        !f.startsWith("standardize")
    );

  // ── Phase A: Parse and standardize each file ──
  const allDiseases = []; // { disease, sourceFile, specialty }
  const standardizedFiles = new Map(); // specialty → { specialty, metadata, diseases[] }

  for (const file of inputFiles) {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    const specialty = data.specialty || "(unknown)";

    const stdDiseases = [];
    if (Array.isArray(data.diseases)) {
      for (const disease of data.diseases) {
        const std = standardizeDisease(disease, specialty);
        stdDiseases.push(std);
        allDiseases.push({
          disease: std,
          sourceFile: file,
          specialty,
          normalizedName: std.disease_name.toLowerCase().trim(),
        });
      }
    }

    standardizedFiles.set(specialty, {
      specialty,
      schema_version: "2.0.0",
      metadata: data.metadata || {},
      diseases: stdDiseases,
    });
  }

  // ── Phase B: Detect shared diseases across specialties ──
  const diseaseMap = new Map(); // normalizedName → [{ specialty, sourceFile }]
  for (const entry of allDiseases) {
    if (!diseaseMap.has(entry.normalizedName)) {
      diseaseMap.set(entry.normalizedName, []);
    }
    diseaseMap.get(entry.normalizedName).push(entry);
  }

  for (const [normName, entries] of diseaseMap) {
    const uniqueSpecialties = [...new Set(entries.map((e) => e.specialty))];
    if (uniqueSpecialties.length > 1) {
      // Mark all instances
      for (const entry of entries) {
        entry.disease.is_shared_disease = true;
        entry.disease.shared_specialties = uniqueSpecialties;
      }
      report.shared_diseases.push({
        disease_name: entries[0].disease.disease_name,
        specialties: uniqueSpecialties,
        files: [...new Set(entries.map((e) => e.sourceFile))],
      });
      report.statistics.shared_diseases_count++;
    }
  }

  // ── Phase C: Write standardized files ──
  for (const [specialty, fileData] of standardizedFiles) {
    const outFileName =
      SPECIALTY_FILE_MAP[specialty] ||
      specialty.toLowerCase().replace(/\s+/g, "_") + ".json";
    const outPath = path.join(outDir, outFileName);
    fs.writeFileSync(outPath, JSON.stringify(fileData, null, 2), "utf-8");
    report.files_produced.push(outFileName);
  }

  // ── Phase D: Write standardization report ──
  report.standardized_at = new Date().toISOString();

  // Clean up enum_mappings: only keep entries that were actually remapped
  for (const category of ["severity", "onset_stage", "organ_system"]) {
    const mappings = report.enum_mappings[category];
    for (const key of Object.keys(mappings)) {
      // Remove entries that map to themselves
      if (key === mappings[key].to) {
        delete mappings[key];
      }
    }
  }

  const reportPath = path.join(outDir, "standardization_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  // ── Console summary ──
  console.log(`\n✅  Standardization complete.`);
  console.log(`    Schema Version       : ${report.schema_version}`);
  console.log(`    Diseases Processed   : ${report.statistics.total_diseases_processed}`);
  console.log(`    Symptoms Processed   : ${report.statistics.total_symptoms_processed}`);
  console.log(`    Fields Renamed       : ${report.statistics.fields_renamed_count}`);
  console.log(`    Severity Remapped    : ${report.statistics.severity_remapped}`);
  console.log(`    Onset Remapped       : ${report.statistics.onset_remapped}`);
  console.log(`    Organ Sys Remapped   : ${report.statistics.organ_system_remapped}`);
  console.log(`    Evidence Normalized  : ${report.statistics.evidence_sources_normalized}`);
  console.log(`    Shared Diseases      : ${report.statistics.shared_diseases_count}`);
  console.log(`    Files Produced       : ${report.files_produced.join(", ")}`);
  console.log(`    Report               : ${reportPath}\n`);
}

main();
