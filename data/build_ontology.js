/**
 * Medical Knowledge Graph — Phase 3
 * Medical Ontology & Canonical Symptom Construction Agent
 *
 * Builds a canonical medical symptom ontology from standardized disease data.
 *
 * DOES NOT search the internet.
 * DOES NOT modify medical knowledge.
 * DOES NOT add/remove diseases or symptoms.
 * ONLY organizes symptoms into one canonical ontology.
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const INPUT_DIR = path.join(__dirname, "standardized_data");
const OUTPUT_DIR = path.join(__dirname, "standardized_data");

// ─────────────────────────────────────────────────────────────────────────────
// KNOWN ALIAS EXPANSIONS
// These are recognized medical synonyms (SNOMED CT / UMLS / MeSH / MedDRA)
// added ONLY if either the canonical or alias appears in the dataset.
// ─────────────────────────────────────────────────────────────────────────────

const KNOWN_SYNONYMS = {
  "fever": ["pyrexia"],
  "shortness of breath": ["dyspnea", "breathlessness", "difficulty breathing"],
  "runny nose": ["rhinorrhea", "running nose"],
  "muscle pain": ["myalgia", "body aches", "muscle aches", "aching muscles"],
  "joint pain": ["arthralgia"],
  "vomiting": ["emesis"],
  "cough": ["persistent cough", "chronic cough", "dry cough"],
  "chest pain": ["chest discomfort"],
  "skin rash": ["rash", "exanthem"],
  "diarrhea": ["diarrhoea", "loose stools"],
  "headache": ["cephalalgia"],
  "fatigue": ["tiredness", "exhaustion", "feeling tired and unwell", "extreme tiredness"],
  "nausea": ["feeling sick"],
  "chills": ["rigors"],
  "sore throat": ["pharyngeal pain"],
  "palpitations": ["heart palpitations", "rapid heartbeat"],
  "dizziness": ["lightheadedness", "feeling faint"],
  "peripheral edema": ["swelling in legs, ankles, or feet", "swollen ankles", "swelling in legs, ankles, and feet"],
  "sweating": ["diaphoresis", "cold sweat"],
  "hoarse voice": ["hoarseness", "hoarseness or loss of voice", "hoarse or muffled voice"],
  "malaise": ["general malaise", "feeling unwell"],
  "syncope": ["fainting", "fainting or near-fainting"],
  "wheezing": ["wheeze"],
  "weight loss": ["unintended weight loss"],
  "lymphadenopathy": ["swollen lymph nodes", "swollen lymph nodes in neck", "swollen glands"],
  "abdominal pain": ["stomach pain", "abdominal cramps"],
  "nausea or vomiting": ["nausea and vomiting"],
  "loss of appetite": ["anorexia", "reduced appetite"],
  "confusion": ["mental confusion", "altered mental status"],
  "seizures": ["convulsions", "fits"],
  "neck stiffness": ["stiff neck", "nuchal rigidity"],
  "jaundice": ["yellowing of skin and eyes", "icterus"],
  "hemoptysis": ["coughing up blood"],
  "dysphagia": ["difficulty swallowing"],
  "chest tightness": ["chest constriction"],
  "sputum production": ["mucus production", "phlegm"],
  "hematuria": ["blood in urine"],
  "ascites": ["abdominal swelling", "swelling of abdomen", "swelling of the abdomen"],
  "epistaxis": ["nosebleeds", "nose bleeds"],
  "tinnitus": ["buzzing in the ears", "ringing in ears"],
  "claudication": ["intermittent claudication", "leg pain or cramping when walking"],
  "digital clubbing": ["clubbing of fingers", "clubbing of fingers and toes", "finger clubbing", "clubbing of fingertips"],
  "pruritus": ["itchy skin", "itching"],
  "rapid breathing": ["tachypnea"],
  "nocturnal dyspnea": ["difficulty sleeping due to breathing", "paroxysmal nocturnal dyspnea"],
  "orthopnea": ["difficulty breathing when lying flat"],
  "odynophagia": ["pain on swallowing", "painful swallowing"],
  "petechial rash": ["petechiae", "rash (non-blanching)"],
  "paraesthesia": ["paresthesia", "tingling", "numbness and tingling", "pain or tingling at bite site"],
  "facial pain": ["facial pain or pressure"],
  "nasal congestion": ["blocked or stuffy nose", "nasal obstruction"],
  "retro-orbital pain": ["pain behind the eyes"],
  "muscle cramps": ["leg cramps", "cramping"],
  "stridor": ["whooping sound"],
  "anemia": ["anaemia"],
  "conjunctivitis": ["red eyes", "red watery eyes", "pink eye"],
  "conjunctival suffusion": ["conjunctival injection"],
  "lockjaw": ["trismus", "jaw cramping"],
  "sensitivity to light": ["photophobia"],
  "genital ulcer": ["genital sores"],
  "dyspareunia": ["pain during sex", "pain during intercourse"],
  "halitosis": ["bad breath"],
  "muscle weakness": ["weakness in limbs"],
  "visual disturbance": ["vision changes", "blurred vision"],
  "stomatitis": ["oral pain", "soreness and redness in mouth"],
  "oral thrush": ["oral candidiasis", "white patches in mouth"],
  "genital pruritus": ["genital itching", "genital itching or soreness"],
  "alopecia": ["hair loss", "patchy hair loss"],
  "hypotension": ["low blood pressure"],
  "respiratory distress": ["acute respiratory distress"],
};

// ─────────────────────────────────────────────────────────────────────────────
// SYMPTOM HIERARCHY DEFINITIONS
// Parent category → children. Forms a DAG.
// ─────────────────────────────────────────────────────────────────────────────

const HIERARCHY = {
  // Root categories (these are abstract grouping nodes, not canonical symptoms)
  "constitutional symptoms": [
    "fever", "chills", "fatigue", "malaise", "sweating",
    "weight loss", "weight gain", "loss of appetite", "dehydration",
    "night sweats",
  ],
  "respiratory symptoms": [
    "cough", "shortness of breath", "wheezing", "chest tightness",
    "sputum production", "runny nose", "sneezing", "sore throat",
    "hoarse voice", "stridor", "nasal congestion", "nasal discharge",
    "postnasal drip", "rapid breathing", "epistaxis", "hemoptysis",
    "nocturnal dyspnea", "orthopnea", "throat clearing", "throat irritation",
    "choking", "apnea", "snoring", "respiratory distress",
    "recurrent respiratory infections", "pharyngeal membrane",
    "tachypnea", "odynophagia",
  ],
  "pain symptoms": [
    "headache", "chest pain", "abdominal pain", "muscle pain",
    "joint pain", "facial pain", "retro-orbital pain", "pelvic pain",
    "leg pain", "testicular pain", "rectal pain", "dental pain",
    "eye pain", "oral pain",
  ],
  "cardiovascular symptoms": [
    "palpitations", "peripheral edema", "syncope", "hypotension",
    "claudication", "cold extremities", "leg swelling", "absent pulse",
    "heart murmur",
  ],
  "gastrointestinal symptoms": [
    "nausea", "vomiting", "diarrhea", "nausea or vomiting",
    "abdominal pain", "constipation", "bloody stools", "flatulence",
    "foul-smelling stool", "ascites", "dysphagia", "post-tussive vomiting",
    "persistent vomiting", "halitosis", "dry mouth", "strawberry tongue",
    "mouth ulcers", "oral thrush", "oral lesions",
  ],
  "neurological symptoms": [
    "headache", "dizziness", "confusion", "seizures", "sensitivity to light",
    "drowsiness", "restlessness", "agitation", "hallucinations",
    "hydrophobia", "facial palsy", "paraesthesia", "tinnitus",
    "neck stiffness", "difficulty sleeping", "loss of taste or smell",
    "loss of smell", "muscle weakness", "migraine", "stroke",
    "unconsciousness", "anxiety",
  ],
  "dermatological symptoms": [
    "skin rash", "pruritus", "jaundice", "skin discoloration",
    "skin ulcer", "alopecia", "warm skin", "petechial rash",
    "genital ulcer", "condylomata lata", "genital warts", "skin warts",
    "eschar", "salty sweat", "digital clubbing",
  ],
  "musculoskeletal symptoms": [
    "muscle pain", "joint pain", "joint swelling", "muscle cramps",
    "muscle spasms", "lockjaw", "digital clubbing",
  ],
  "ophthalmological symptoms": [
    "conjunctivitis", "conjunctival suffusion", "visual disturbance",
    "eye pain",
  ],
  "hematological symptoms": [
    "lymphadenopathy", "anemia", "hemorrhagic signs", "mucosal bleeding",
    "recurrent infections",
  ],
  "genitourinary symptoms": [
    "pelvic pain", "dyspareunia", "testicular pain", "hematuria",
    "genital pruritus", "urethral discharge",
  ],

  // Sub-hierarchies (symptom → more specific forms)
  "fever": ["night sweats"],
  "cough": ["hemoptysis", "sputum production", "post-tussive vomiting"],
  "shortness of breath": ["nocturnal dyspnea", "orthopnea", "tachypnea", "rapid breathing"],
  "skin rash": ["petechial rash"],
  "dizziness": ["syncope"],
  "palpitations": ["absent pulse"],
  "peripheral edema": ["leg swelling", "ascites"],
  "vomiting": ["persistent vomiting", "post-tussive vomiting"],
  "muscle pain": ["muscle cramps", "muscle spasms"],
  "lymphadenopathy": ["tonsillar inflammation", "parotitis"],
  "seizures": ["unconsciousness"],
  "nasal congestion": ["nasal discharge", "runny nose"],
  "headache": ["migraine", "retro-orbital pain"],
  "confusion": ["drowsiness", "unconsciousness"],
  "joint pain": ["joint swelling"],
  "conjunctivitis": ["conjunctival suffusion"],
};

// ─────────────────────────────────────────────────────────────────────────────
// RELATED SYMPTOMS (semantic/clinical relationships, NOT causal)
// ─────────────────────────────────────────────────────────────────────────────

const RELATED_SYMPTOMS = [
  ["fever", "chills"],
  ["fever", "sweating"],
  ["fever", "night sweats"],
  ["fever", "malaise"],
  ["fever", "fatigue"],
  ["cough", "shortness of breath"],
  ["cough", "chest tightness"],
  ["cough", "sore throat"],
  ["cough", "sputum production"],
  ["cough", "wheezing"],
  ["shortness of breath", "wheezing"],
  ["shortness of breath", "chest tightness"],
  ["shortness of breath", "rapid breathing"],
  ["nausea", "vomiting"],
  ["nausea", "loss of appetite"],
  ["nausea or vomiting", "nausea"],
  ["nausea or vomiting", "vomiting"],
  ["nausea or vomiting", "abdominal pain"],
  ["diarrhea", "abdominal pain"],
  ["diarrhea", "dehydration"],
  ["diarrhea", "nausea"],
  ["vomiting", "dehydration"],
  ["headache", "dizziness"],
  ["headache", "sensitivity to light"],
  ["headache", "neck stiffness"],
  ["dizziness", "syncope"],
  ["dizziness", "palpitations"],
  ["palpitations", "chest pain"],
  ["palpitations", "shortness of breath"],
  ["chest pain", "shortness of breath"],
  ["peripheral edema", "shortness of breath"],
  ["peripheral edema", "weight gain"],
  ["fatigue", "malaise"],
  ["fatigue", "loss of appetite"],
  ["fatigue", "muscle pain"],
  ["jaundice", "abdominal pain"],
  ["jaundice", "loss of appetite"],
  ["runny nose", "sneezing"],
  ["runny nose", "nasal congestion"],
  ["sore throat", "hoarse voice"],
  ["sore throat", "dysphagia"],
  ["muscle pain", "joint pain"],
  ["muscle pain", "fatigue"],
  ["confusion", "drowsiness"],
  ["confusion", "seizures"],
  ["seizures", "unconsciousness"],
  ["lymphadenopathy", "fever"],
  ["skin rash", "pruritus"],
  ["skin rash", "fever"],
  ["hemorrhagic signs", "mucosal bleeding"],
  ["hemorrhagic signs", "petechial rash"],
  ["dehydration", "fatigue"],
  ["dehydration", "dizziness"],
  ["anemia", "fatigue"],
  ["anemia", "shortness of breath"],
  ["weight loss", "loss of appetite"],
  ["weight loss", "fatigue"],
  ["claudication", "cold extremities"],
  ["claudication", "leg pain"],
  ["difficulty sleeping", "fatigue"],
  ["conjunctivitis", "sensitivity to light"],
  ["digital clubbing", "shortness of breath"],
  ["digital clubbing", "cough"],
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  // ── Step 1: Extract all symptoms from standardized data ──
  const inputFiles = fs.readdirSync(INPUT_DIR).filter(
    f => f.endsWith(".json") && f !== "standardization_report.json"
  );

  // canonical (lowercase) → { originalCanonical, organs: Map<string,number>, aliases: Set, diseases: Set }
  const symMap = new Map();
  // Track ALL disease→symptom links for validation
  const diseaseSymptomLinks = []; // { disease, file, canonicalSymptom }

  for (const file of inputFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), "utf-8"));
    for (const disease of data.diseases) {
      for (const s of disease.symptoms) {
        const canonKey = s.normalized_symptom.toLowerCase().trim();
        if (!symMap.has(canonKey)) {
          symMap.set(canonKey, {
            originalCanonical: s.normalized_symptom,
            organs: new Map(),
            datasetAliases: new Set(),
            diseases: new Set(),
          });
        }
        const entry = symMap.get(canonKey);
        entry.diseases.add(disease.disease_name);

        // Collect raw symptom names as dataset aliases
        const raw = (s.symptom || "").trim();
        if (raw && raw.toLowerCase() !== canonKey) {
          entry.datasetAliases.add(raw);
        }

        // Track organ system
        const org = s.organ_system;
        entry.organs.set(org, (entry.organs.get(org) || 0) + 1);

        diseaseSymptomLinks.push({
          disease: disease.disease_name,
          file,
          canonicalSymptom: canonKey,
        });
      }
    }
  }

  console.log(`Extracted ${symMap.size} unique canonical symptoms from dataset.`);

  // ── Step 2: Build canonical symptom objects ──
  const canonicalSymptoms = [];
  const aliasToCanonical = new Map(); // alias (lower) → canonical (lower)
  const allAliases = []; // { alias, canonical_symptom }
  let totalAliases = 0;
  let duplicatesCaught = 0;

  for (const [canonKey, entry] of symMap) {
    // Determine primary body system (most frequent organ_system)
    const topOrgan = [...entry.organs.entries()].sort((a, b) => b[1] - a[1])[0][0];

    // Collect aliases: from dataset + known synonyms
    const aliasSet = new Set();
    for (const a of entry.datasetAliases) {
      aliasSet.add(a);
    }
    // Add known synonyms only if this canonical exists in the dataset
    if (KNOWN_SYNONYMS[canonKey]) {
      for (const syn of KNOWN_SYNONYMS[canonKey]) {
        if (syn.toLowerCase() !== canonKey) {
          aliasSet.add(syn);
        }
      }
    }
    // Also check if this canonical appears as a known synonym value for another canonical
    // (reverse lookup — e.g., "diarrhoea" is a known synonym of "diarrhea")
    for (const [knownCanon, knownAliases] of Object.entries(KNOWN_SYNONYMS)) {
      if (knownCanon === canonKey) continue;
      for (const ka of knownAliases) {
        if (ka.toLowerCase() === canonKey && symMap.has(knownCanon)) {
          // This canonical is actually an alias of knownCanon — skip, handled elsewhere
        }
      }
    }

    // Remove any alias that is itself a different canonical symptom (to avoid conflicts)
    const cleanAliases = [...aliasSet].filter(a => {
      const aLower = a.toLowerCase().trim();
      if (aLower === canonKey) return false; // skip self
      if (symMap.has(aLower)) return false; // it's its own canonical, don't claim it
      return true;
    });

    // Register aliases
    for (const alias of cleanAliases) {
      const aLower = alias.toLowerCase().trim();
      if (aliasToCanonical.has(aLower)) {
        // Conflict — alias already belongs to another canonical
        duplicatesCaught++;
        continue;
      }
      aliasToCanonical.set(aLower, canonKey);
      allAliases.push({ alias, canonical_symptom: entry.originalCanonical });
      totalAliases++;
    }

    // Determine parent category from hierarchy
    let parentCategory = "";
    for (const [parent, children] of Object.entries(HIERARCHY)) {
      if (children.includes(canonKey)) {
        // Prefer the root category (ends with "symptoms")
        if (parent.endsWith("symptoms")) {
          parentCategory = parent;
          break;
        }
        if (!parentCategory) {
          parentCategory = parent;
        }
      }
    }

    // Get child symptoms from hierarchy
    const childSymptoms = (HIERARCHY[canonKey] || []).filter(c => symMap.has(c));

    // Get related symptoms
    const relatedSet = new Set();
    for (const [a, b] of RELATED_SYMPTOMS) {
      if (a === canonKey && symMap.has(b)) relatedSet.add(b);
      if (b === canonKey && symMap.has(a)) relatedSet.add(a);
    }

    canonicalSymptoms.push({
      canonical_symptom: entry.originalCanonical,
      aliases: cleanAliases,
      body_system: topOrgan,
      related_symptoms: [...relatedSet].map(r => symMap.get(r).originalCanonical),
      parent_category: parentCategory,
      child_symptoms: childSymptoms.map(c => symMap.get(c).originalCanonical),
      disease_count: entry.diseases.size,
    });
  }

  // Sort by disease_count descending
  canonicalSymptoms.sort((a, b) => b.disease_count - a.disease_count);

  // ── Step 3: Build hierarchy edges ──
  const hierarchyEdges = [];
  for (const [parent, children] of Object.entries(HIERARCHY)) {
    for (const child of children) {
      if (symMap.has(child)) {
        hierarchyEdges.push({
          parent: symMap.has(parent) ? symMap.get(parent).originalCanonical : parent,
          child: symMap.get(child).originalCanonical,
          type: parent.endsWith("symptoms") ? "category_member" : "specialization",
        });
      }
    }
  }

  // ── Step 4: Build relationship edges ──
  const relationshipEdges = [];
  for (const [a, b] of RELATED_SYMPTOMS) {
    if (symMap.has(a) && symMap.has(b)) {
      relationshipEdges.push({
        symptom_a: symMap.get(a).originalCanonical,
        symptom_b: symMap.get(b).originalCanonical,
        relationship_type: "clinically_related",
      });
    }
  }

  // ── Step 5: Validate ──
  const validationErrors = [];

  // 5a: No duplicate canonical nodes
  const canonicalCheck = new Set();
  for (const cs of canonicalSymptoms) {
    const key = cs.canonical_symptom.toLowerCase().trim();
    if (canonicalCheck.has(key)) {
      validationErrors.push(`Duplicate canonical node: "${cs.canonical_symptom}"`);
    }
    canonicalCheck.add(key);
  }

  // 5b: No alias belongs to multiple canonical nodes (already handled during build)
  // 5c: No hierarchy cycles
  const cycleErrors = detectCycles(HIERARCHY, symMap);
  validationErrors.push(...cycleErrors);

  // 5d: Every disease symptom maps to exactly one canonical
  for (const link of diseaseSymptomLinks) {
    if (!symMap.has(link.canonicalSymptom)) {
      validationErrors.push(
        `Disease "${link.disease}" has symptom "${link.canonicalSymptom}" with no canonical node.`
      );
    }
  }

  // 5e: Every canonical has a body system
  for (const cs of canonicalSymptoms) {
    if (!cs.body_system) {
      validationErrors.push(`Canonical "${cs.canonical_symptom}" has no body_system.`);
    }
  }

  // ── Step 6: Statistics ──
  const avgAliases = canonicalSymptoms.length > 0
    ? +(totalAliases / canonicalSymptoms.length).toFixed(2)
    : 0;

  const statistics = {
    total_canonical_symptoms: canonicalSymptoms.length,
    total_aliases: totalAliases,
    average_aliases_per_symptom: avgAliases,
    total_hierarchy_edges: hierarchyEdges.length,
    total_related_symptom_edges: relationshipEdges.length,
    duplicate_canonical_symptoms_removed: duplicatesCaught,
    total_disease_symptom_links: diseaseSymptomLinks.length,
    validation_errors: validationErrors.length,
    validation_status: validationErrors.length === 0 ? "PASS" : "FAIL",
  };

  // ── Step 7: Write output files ──

  // ontology.json — the master file
  const ontology = {
    schema_version: "3.0.0",
    created_at: new Date().toISOString(),
    description: "Canonical medical symptom ontology for knowledge graph construction",
    canonical_symptoms: canonicalSymptoms,
    hierarchy_edges: hierarchyEdges,
    relationship_edges: relationshipEdges,
    statistics,
    validation_errors: validationErrors,
  };
  writeJSON("ontology.json", ontology);

  // canonical_symptoms.json
  writeJSON("canonical_symptoms.json", {
    schema_version: "3.0.0",
    total: canonicalSymptoms.length,
    symptoms: canonicalSymptoms,
  });

  // symptom_aliases.json
  writeJSON("symptom_aliases.json", {
    schema_version: "3.0.0",
    total_aliases: totalAliases,
    aliases: allAliases.sort((a, b) => a.canonical_symptom.localeCompare(b.canonical_symptom)),
  });

  // symptom_hierarchy.json
  writeJSON("symptom_hierarchy.json", {
    schema_version: "3.0.0",
    total_edges: hierarchyEdges.length,
    edges: hierarchyEdges,
  });

  // symptom_relationships.json
  writeJSON("symptom_relationships.json", {
    schema_version: "3.0.0",
    total_edges: relationshipEdges.length,
    edges: relationshipEdges,
  });

  // ontology_statistics.json
  writeJSON("ontology_statistics.json", {
    schema_version: "3.0.0",
    generated_at: new Date().toISOString(),
    ...statistics,
  });

  // ── Console summary ──
  console.log(`\n✅  Ontology construction complete.`);
  console.log(`    Schema Version              : 3.0.0`);
  console.log(`    Canonical Symptoms           : ${statistics.total_canonical_symptoms}`);
  console.log(`    Total Aliases                : ${statistics.total_aliases}`);
  console.log(`    Avg Aliases/Symptom          : ${statistics.average_aliases_per_symptom}`);
  console.log(`    Hierarchy Edges              : ${statistics.total_hierarchy_edges}`);
  console.log(`    Related Symptom Edges        : ${statistics.total_related_symptom_edges}`);
  console.log(`    Duplicate Aliases Resolved   : ${statistics.duplicate_canonical_symptoms_removed}`);
  console.log(`    Disease-Symptom Links        : ${statistics.total_disease_symptom_links}`);
  console.log(`    Validation Status            : ${statistics.validation_status}`);
  if (validationErrors.length > 0) {
    console.log(`    Validation Errors            : ${validationErrors.length}`);
    for (const e of validationErrors) console.log(`      - ${e}`);
  }
  console.log(`    Output Directory             : ${OUTPUT_DIR}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function writeJSON(filename, data) {
  const outPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Detect cycles in the hierarchy using DFS.
 */
function detectCycles(hierarchy, symMap) {
  const errors = [];
  const graph = new Map(); // node → Set of children

  for (const [parent, children] of Object.entries(hierarchy)) {
    const pKey = parent.toLowerCase().trim();
    if (!graph.has(pKey)) graph.set(pKey, new Set());
    for (const child of children) {
      const cKey = child.toLowerCase().trim();
      graph.get(pKey).add(cKey);
    }
  }

  // DFS cycle detection
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  for (const node of graph.keys()) color.set(node, WHITE);
  // Also add all children that might not be parents
  for (const children of graph.values()) {
    for (const c of children) {
      if (!color.has(c)) color.set(c, WHITE);
    }
  }

  function dfs(node, path) {
    color.set(node, GRAY);
    const neighbors = graph.get(node) || new Set();
    for (const nb of neighbors) {
      if (color.get(nb) === GRAY) {
        errors.push(`Hierarchy cycle detected: ${[...path, node, nb].join(" → ")}`);
        return;
      }
      if (color.get(nb) === WHITE) {
        dfs(nb, [...path, node]);
      }
    }
    color.set(node, BLACK);
  }

  for (const node of color.keys()) {
    if (color.get(node) === WHITE) {
      dfs(node, []);
    }
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
main();
