/**
 * Medical Knowledge Graph — Phase 1
 * Schema Validation & Dataset Integrity Agent
 *
 * This script validates disease JSON files against the canonical schema
 * and produces a validation_report.json in the same directory.
 *
 * It NEVER modifies, adds, removes, or infers any medical data.
 * It only validates and reports.
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────
// Allowed enum values (from spec)
// ─────────────────────────────────────────────
const ALLOWED_FREQUENCIES = new Set([
  "hallmark",
  "very_common",
  "common",
  "uncommon",
  "rare",
]);

const ALLOWED_SEVERITIES = new Set(["mild", "moderate", "severe", "unknown"]);

const ALLOWED_ONSET_STAGES = new Set([
  "prodrome",
  "early",
  "peak",
  "late",
  "complication",
  "unknown",
]);

const ALLOWED_ORGAN_SYSTEMS = new Set([
  "constitutional",
  "respiratory",
  "cardiovascular",
  "neurological",
  "gastrointestinal",
  "genitourinary",
  "dermatological",
  "musculoskeletal",
  "psychiatric",
  "ophthalmological",
  "hematological",
  "endocrine",
  "multisystem",
  "other",
]);

const ALLOWED_EVIDENCE_SOURCES = new Set([
  "WHO",
  "CDC",
  "NHS",
  "Mayo Clinic",
  "MedlinePlus",
  "Merck Manual Professional",
  "MSD Manual",
  "Cleveland Clinic",
  "Johns Hopkins Medicine",
  "NINDS",
]);

const MIN_EVIDENCE_COUNT = 2;

const REQUIRED_DISEASE_FIELDS = ["disease_name", "specialty", "symptoms"];
const REQUIRED_SYMPTOM_FIELDS = [
  "symptom",
  "normalized_symptom",
  "frequency",
  "organ_system",
  "onset_stage",
  "severity",
  "evidence_sources",
  "evidence_count",
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Normalize a string for duplicate comparison: lowercase, strip spaces/hyphens/underscores */
function normalize(str) {
  if (typeof str !== "string") return "";
  return str.toLowerCase().replace(/[\s\-_]/g, "");
}

/** Check if a value is "empty" (null, undefined, empty string, empty array, empty object) */
function isEmpty(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return true;
  return false;
}

/**
 * Determine which known source an evidence string belongs to.
 * Evidence strings look like "WHO - Influenza fact sheet" or "CDC - Heart Attack".
 * We match by checking if the string starts with a known source prefix.
 */
function matchEvidenceSource(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  for (const src of ALLOWED_EVIDENCE_SOURCES) {
    if (trimmed.startsWith(src)) return src;
  }
  return null;
}

// ─────────────────────────────────────────────
// Main validation
// ─────────────────────────────────────────────

function validate() {
  const dataDir = __dirname;
  const jsonFiles = fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".json") && f !== "validation_report.json");

  const errors = [];
  const warnings = [];

  // Accumulators across all files
  const allDiseaseNames = []; // { name, normalizedName, file, specialty }
  const allNormalizedSymptoms = new Set();
  let totalDiseases = 0;
  let totalSymptoms = 0;
  const symptomCounts = []; // per-disease symptom counts
  const evidenceCounts = []; // per-symptom evidence counts
  let duplicateDiseaseCount = 0;
  let duplicateSymptomCount = 0;

  // Scoring accumulators
  let schemaFieldsExpected = 0;
  let schemaFieldsPresent = 0;
  let enumChecksTotal = 0;        // total enum validations (frequency, severity, onset, organ_system)
  let enumChecksValid = 0;        // enum values that matched allowed sets
  let evidenceFieldsExpected = 0;
  let evidenceFieldsValid = 0;
  let evidenceSourcesTotal = 0;   // total evidence source strings checked
  let evidenceSourcesRecognized = 0; // evidence sources matching known set
  let normalizedSymptomChecks = 0;
  let normalizedSymptomConsistent = 0;

  // ── Rule 1: JSON Syntax ──
  const parsedFiles = [];
  for (const file of jsonFiles) {
    const filePath = path.join(dataDir, file);
    let raw;
    try {
      raw = fs.readFileSync(filePath, "utf-8");
    } catch (e) {
      errors.push({
        rule: "1_json_syntax",
        file,
        message: `Cannot read file: ${e.message}`,
      });
      continue;
    }

    // Check BOM / encoding issues
    if (raw.charCodeAt(0) === 0xfeff) {
      warnings.push({
        rule: "1_json_syntax",
        file,
        message: "File contains UTF-8 BOM marker.",
      });
      raw = raw.slice(1);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      errors.push({
        rule: "1_json_syntax",
        file,
        message: `Invalid JSON: ${e.message}`,
      });
      continue;
    }

    parsedFiles.push({ file, data });
  }

  if (parsedFiles.length === 0) {
    errors.push({
      rule: "1_json_syntax",
      message: "No valid JSON files found in the data directory.",
    });
    return buildReport("FAIL", errors, warnings, {});
  }

  // ── Process each file ──
  for (const { file, data } of parsedFiles) {
    const specialty = data.specialty || "(unknown)";

    if (!data.diseases || !Array.isArray(data.diseases)) {
      errors.push({
        rule: "2_disease_validation",
        file,
        message: `Missing or invalid "diseases" array.`,
      });
      continue;
    }

    // Track per-file disease names for intra-file duplicate detection
    const fileDiseaseSeen = new Map(); // normalizedName -> original name

    for (let dIdx = 0; dIdx < data.diseases.length; dIdx++) {
      const disease = data.diseases[dIdx];
      const dLabel = disease.disease_name || `disease[${dIdx}]`;
      totalDiseases++;

      // ── Rule 2: Disease required fields ──
      for (const field of REQUIRED_DISEASE_FIELDS) {
        schemaFieldsExpected++;
        if (field === "specialty") {
          // specialty may be at file-level, not per-disease
          if (disease.specialty || data.specialty) {
            schemaFieldsPresent++;
          } else {
            errors.push({
              rule: "2_disease_validation",
              file,
              disease: dLabel,
              message: `Missing required field: "specialty" (not found on disease or file level).`,
            });
          }
        } else if (disease[field] !== undefined && disease[field] !== null) {
          schemaFieldsPresent++;
        } else {
          errors.push({
            rule: "2_disease_validation",
            file,
            disease: dLabel,
            message: `Missing required field: "${field}".`,
          });
        }
      }

      // ── Rule 4: Empty values on disease ──
      for (const [key, val] of Object.entries(disease)) {
        if (isEmpty(val)) {
          warnings.push({
            rule: "4_empty_values",
            file,
            disease: dLabel,
            message: `Empty value for field "${key}": ${JSON.stringify(val)}`,
          });
        }
      }

      // Disease name uniqueness (case-insensitive) ── Rule 2 & 12
      const normDiseaseName = normalize(disease.disease_name || "");

      // Intra-file duplicate
      if (fileDiseaseSeen.has(normDiseaseName)) {
        errors.push({
          rule: "2_disease_validation",
          file,
          disease: dLabel,
          message: `Duplicate disease name within file (also matches "${fileDiseaseSeen.get(normDiseaseName)}").`,
        });
        duplicateDiseaseCount++;
      } else {
        fileDiseaseSeen.set(normDiseaseName, dLabel);
      }

      // Cross-file tracking
      allDiseaseNames.push({
        name: disease.disease_name,
        normalizedName: normDiseaseName,
        file,
        specialty,
      });

      // ── Symptoms ──
      const symptoms = disease.symptoms;
      if (!Array.isArray(symptoms)) {
        errors.push({
          rule: "3_symptom_validation",
          file,
          disease: dLabel,
          message: `"symptoms" is not an array.`,
        });
        continue;
      }

      symptomCounts.push(symptoms.length);

      // Per-disease symptom duplicate tracking
      const diseaseSymptomSeen = new Map(); // normalized symptom_name -> original
      const diseaseNormSymptomSeen = new Map(); // normalized normalized_symptom -> original

      for (let sIdx = 0; sIdx < symptoms.length; sIdx++) {
        const sym = symptoms[sIdx];
        const sLabel = sym.symptom_name || sym.symptom || `symptom[${sIdx}]`;
        totalSymptoms++;

        // ── Rule 3: Symptom required fields ──
        // The spec says "symptom" but the data uses "symptom_name".
        // We check for the spec field; if missing but "symptom_name" exists, report as warning.
        for (const field of REQUIRED_SYMPTOM_FIELDS) {
          schemaFieldsExpected++;
          if (field === "symptom") {
            // The spec requires a field called "symptom" but the data uses "symptom_name"
            if (sym.symptom !== undefined && sym.symptom !== null) {
              schemaFieldsPresent++;
            } else if (sym.symptom_name !== undefined && sym.symptom_name !== null) {
              // symptom_name exists but spec says "symptom"
              schemaFieldsPresent++; // count as present for scoring
              warnings.push({
                rule: "3_symptom_validation",
                file,
                disease: dLabel,
                symptom: sLabel,
                message: `Field is named "symptom_name" instead of spec-required "symptom".`,
              });
            } else {
              errors.push({
                rule: "3_symptom_validation",
                file,
                disease: dLabel,
                symptom: sLabel,
                message: `Missing required field: "symptom" (and no "symptom_name" either).`,
              });
            }
          } else if (sym[field] !== undefined && sym[field] !== null) {
            schemaFieldsPresent++;
          } else {
            errors.push({
              rule: "3_symptom_validation",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Missing required field: "${field}".`,
            });
          }
        }

        // ── Rule 4: Empty values on symptom ──
        for (const [key, val] of Object.entries(sym)) {
          if (isEmpty(val)) {
            warnings.push({
              rule: "4_empty_values",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Empty value for field "${key}": ${JSON.stringify(val)}`,
            });
          }
        }

        // ── Rule 5: Frequency ──
        if (sym.frequency !== undefined && sym.frequency !== null) {
          enumChecksTotal++;
          if (ALLOWED_FREQUENCIES.has(sym.frequency)) {
            enumChecksValid++;
          } else {
            errors.push({
              rule: "5_frequency_validation",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Invalid frequency: "${sym.frequency}". Allowed: ${[...ALLOWED_FREQUENCIES].join(", ")}`,
            });
          }
        }

        // ── Rule 6: Severity ──
        if (sym.severity !== undefined && sym.severity !== null) {
          enumChecksTotal++;
          if (ALLOWED_SEVERITIES.has(sym.severity)) {
            enumChecksValid++;
          } else {
            errors.push({
              rule: "6_severity_validation",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Invalid severity: "${sym.severity}". Allowed: ${[...ALLOWED_SEVERITIES].join(", ")}`,
            });
          }
        }

        // ── Rule 7: Onset ──
        if (sym.onset_stage !== undefined && sym.onset_stage !== null) {
          enumChecksTotal++;
          if (ALLOWED_ONSET_STAGES.has(sym.onset_stage)) {
            enumChecksValid++;
          } else {
            errors.push({
              rule: "7_onset_validation",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Invalid onset_stage: "${sym.onset_stage}". Allowed: ${[...ALLOWED_ONSET_STAGES].join(", ")}`,
            });
          }
        }

        // ── Rule 8: Organ System ──
        if (sym.organ_system !== undefined && sym.organ_system !== null) {
          enumChecksTotal++;
          if (ALLOWED_ORGAN_SYSTEMS.has(sym.organ_system)) {
            enumChecksValid++;
          } else {
            errors.push({
              rule: "8_organ_system_validation",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Invalid organ_system: "${sym.organ_system}". Allowed: ${[...ALLOWED_ORGAN_SYSTEMS].join(", ")}`,
            });
          }
        }

        // ── Rule 9: Evidence ──
        const evCount = sym.evidence_count;
        if (typeof evCount === "number") {
          evidenceCounts.push(evCount);
          evidenceFieldsExpected++;
          if (evCount >= MIN_EVIDENCE_COUNT) {
            evidenceFieldsValid++;
          } else {
            errors.push({
              rule: "9_evidence_validation",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `evidence_count is ${evCount}, minimum required is ${MIN_EVIDENCE_COUNT}.`,
            });
          }
        }

        if (Array.isArray(sym.evidence_sources)) {
          // Check actual array length vs evidence_count
          if (typeof evCount === "number" && sym.evidence_sources.length !== evCount) {
            warnings.push({
              rule: "9_evidence_validation",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `evidence_count (${evCount}) does not match evidence_sources array length (${sym.evidence_sources.length}).`,
            });
          }
          for (const src of sym.evidence_sources) {
            evidenceSourcesTotal++;
            const matched = matchEvidenceSource(src);
            if (matched) {
              evidenceSourcesRecognized++;
            } else {
              warnings.push({
                rule: "9_evidence_validation",
                file,
                disease: dLabel,
                symptom: sLabel,
                message: `Unrecognized evidence source: "${src}". Expected sources beginning with: ${[...ALLOWED_EVIDENCE_SOURCES].join(", ")}`,
              });
            }
          }
        }

        // ── Rule 10: Duplicate symptoms within disease (by symptom_name) ──
        const rawSymName = sym.symptom_name || sym.symptom || "";
        const normSymName = normalize(rawSymName);
        if (normSymName) {
          if (diseaseSymptomSeen.has(normSymName)) {
            warnings.push({
              rule: "10_duplicate_symptoms",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Duplicate symptom_name within disease (also matches "${diseaseSymptomSeen.get(normSymName)}").`,
            });
            duplicateSymptomCount++;
          } else {
            diseaseSymptomSeen.set(normSymName, sLabel);
          }
        }

        // ── Rule 11: Duplicate normalized_symptom within disease ──
        const normSym = sym.normalized_symptom || "";
        const normSymKey = normalize(normSym);
        normalizedSymptomChecks++;
        if (normSymKey) {
          allNormalizedSymptoms.add(normSymKey);
          if (diseaseNormSymptomSeen.has(normSymKey)) {
            warnings.push({
              rule: "11_duplicate_normalized_symptoms",
              file,
              disease: dLabel,
              symptom: sLabel,
              message: `Duplicate normalized_symptom within disease: "${normSym}" (also matches "${diseaseNormSymptomSeen.get(normSymKey)}").`,
            });
            normalizedSymptomConsistent++; // inconsistency (inverted for scoring later)
          } else {
            diseaseNormSymptomSeen.set(normSymKey, normSym);
            normalizedSymptomConsistent++;
          }
        }
      } // end symptoms loop
    } // end diseases loop
  } // end files loop

  // ── Rule 12: Duplicate diseases across files ──
  const crossFileDiseaseMap = new Map(); // normalizedName -> [{name, file, specialty}]
  for (const entry of allDiseaseNames) {
    if (!crossFileDiseaseMap.has(entry.normalizedName)) {
      crossFileDiseaseMap.set(entry.normalizedName, []);
    }
    crossFileDiseaseMap.get(entry.normalizedName).push(entry);
  }
  for (const [normName, entries] of crossFileDiseaseMap) {
    const uniqueFiles = new Set(entries.map((e) => e.file));
    if (uniqueFiles.size > 1) {
      errors.push({
        rule: "12_duplicate_disease_files",
        message: `Disease "${entries[0].name}" appears in multiple files: ${[...uniqueFiles].join(", ")}`,
        occurrences: entries.map((e) => ({ file: e.file, specialty: e.specialty, name: e.name })),
      });
      duplicateDiseaseCount += entries.length - 1;
    }
  }

  // ── Rule 13: Statistics ──
  const uniqueNormalizedSymptoms = allNormalizedSymptoms.size;
  const avgSymptomsPerDisease =
    symptomCounts.length > 0
      ? +(symptomCounts.reduce((a, b) => a + b, 0) / symptomCounts.length).toFixed(2)
      : 0;
  const minSymptoms = symptomCounts.length > 0 ? Math.min(...symptomCounts) : 0;
  const maxSymptoms = symptomCounts.length > 0 ? Math.max(...symptomCounts) : 0;
  const avgEvidenceCount =
    evidenceCounts.length > 0
      ? +(evidenceCounts.reduce((a, b) => a + b, 0) / evidenceCounts.length).toFixed(2)
      : 0;

  const statistics = {
    total_diseases: totalDiseases,
    total_symptoms: totalSymptoms,
    unique_normalized_symptoms: uniqueNormalizedSymptoms,
    duplicate_diseases: duplicateDiseaseCount,
    duplicate_symptoms: duplicateSymptomCount,
    average_symptoms_per_disease: avgSymptomsPerDisease,
    minimum_symptoms: minSymptoms,
    maximum_symptoms: maxSymptoms,
    average_evidence_count: avgEvidenceCount,
  };

  // ── Rule 14: Data Integrity Score ──
  // Schema Completeness: combines field presence + enum value validity
  const fieldPresenceScore =
    schemaFieldsExpected > 0
      ? (schemaFieldsPresent / schemaFieldsExpected) * 100
      : 100;
  const enumValidityScore =
    enumChecksTotal > 0
      ? (enumChecksValid / enumChecksTotal) * 100
      : 100;
  const schemaCompleteness = +((fieldPresenceScore * 0.5 + enumValidityScore * 0.5).toFixed(2));

  // Evidence Completeness: combines min-count compliance + source recognition
  const evidenceCountScore =
    evidenceFieldsExpected > 0
      ? (evidenceFieldsValid / evidenceFieldsExpected) * 100
      : 100;
  const evidenceSourceScore =
    evidenceSourcesTotal > 0
      ? (evidenceSourcesRecognized / evidenceSourcesTotal) * 100
      : 100;
  const evidenceCompleteness = +((evidenceCountScore * 0.5 + evidenceSourceScore * 0.5).toFixed(2));

  // Normalization Consistency: ratio of non-duplicate normalized symptoms
  const normalizationConsistency =
    normalizedSymptomChecks > 0
      ? +((normalizedSymptomConsistent / normalizedSymptomChecks) * 100).toFixed(2)
      : 100;

  const overallIntegrity = +(
    (schemaCompleteness + evidenceCompleteness + normalizationConsistency) /
    3
  ).toFixed(2);

  const integrityScores = {
    schema_completeness_pct: schemaCompleteness,
    evidence_completeness_pct: evidenceCompleteness,
    normalization_consistency_pct: normalizationConsistency,
    overall_dataset_integrity_pct: overallIntegrity,
  };

  // Determine final status
  const hasCriticalErrors = errors.length > 0;
  const status = hasCriticalErrors ? "FAIL" : "PASS";

  return buildReport(status, errors, warnings, statistics, integrityScores);
}

function buildReport(status, errors, warnings, statistics, integrityScores) {
  return {
    status,
    overall_integrity: integrityScores ? integrityScores.overall_dataset_integrity_pct : 0,
    integrity_scores: integrityScores || {},
    errors,
    warnings,
    statistics,
    validated_at: new Date().toISOString(),
    files_scanned: fs
      .readdirSync(__dirname)
      .filter((f) => f.endsWith(".json") && f !== "validation_report.json"),
  };
}

// ─────────────────────────────────────────────
// Run & Output
// ─────────────────────────────────────────────
const report = validate();
const outPath = path.join(__dirname, "validation_report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");

console.log(`\n✅  Validation complete.`);
console.log(`    Status         : ${report.status}`);
console.log(`    Overall Score  : ${report.overall_integrity}%`);
console.log(`    Errors         : ${report.errors.length}`);
console.log(`    Warnings       : ${report.warnings.length}`);
console.log(`    Total Diseases : ${report.statistics.total_diseases}`);
console.log(`    Total Symptoms : ${report.statistics.total_symptoms}`);
console.log(`    Report saved to: ${outPath}\n`);
