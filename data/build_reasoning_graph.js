/**
 * Medical Knowledge Graph — Phase 4
 * Medical Reasoning Graph Construction Agent
 *
 * Transforms the validated ontology and standardized disease datasets into a
 * reasoning graph to support recursive symptom analysis.
 *
 * DOES NOT perform diagnosis, only structural graph construction and metric precomputation.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;
const STD_DIR = path.join(DATA_DIR, "standardized_data");
const OUT_DIR = path.join(DATA_DIR, "reasoning_graph");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LOAD DATA
// ─────────────────────────────────────────────────────────────────────────────

const ontology = JSON.parse(fs.readFileSync(path.join(STD_DIR, "ontology.json"), "utf-8"));

const diseaseFiles = [
  "infectious_diseases.json",
  "respiratory_diseases.json",
  "cardiology_diseases.json"
];

const diseaseDatasets = diseaseFiles.map(f =>
  JSON.parse(fs.readFileSync(path.join(STD_DIR, f), "utf-8"))
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. DATA STRUCTURES & ACCUMULATORS
// ─────────────────────────────────────────────────────────────────────────────

const nodes = {
  Disease: new Map(),
  Symptom: new Map(),
  Alias: new Map(),
  Specialty: new Map(),
  BodySystem: new Map(),
};

const edges = [];

// Indexes
const symptomToDiseases = new Map(); // canonical_symptom -> [disease_id]
const diseaseToSymptoms = new Map(); // disease_id -> [canonical_symptom]
const aliasLookup = new Map(); // alias -> canonical_symptom
const specialtyLookup = new Map(); // specialty -> [disease_id]
const bodySystemLookup = new Map(); // body_system -> [canonical_symptom]

const hallmarkIndex = new Map(); // canonical_symptom -> [disease_id]
const frequencyIndex = new Map(); // symptom -> { frequency -> [disease_id] }

let totalDiseases = 0;

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXTRACT NODES & EDGES
// ─────────────────────────────────────────────────────────────────────────────

// Helper to normalize IDs
const toId = str => str.toLowerCase().trim();

// A. Initialize Symptom Nodes from Ontology
for (const sym of ontology.canonical_symptoms) {
  const symId = toId(sym.canonical_symptom);
  nodes.Symptom.set(symId, {
    id: symId,
    canonical_name: sym.canonical_symptom,
    aliases: sym.aliases,
    body_system: sym.body_system,
    coverage_count: 0,
    coverage_percentage: 0,
    information_gain: 0,
    positive_information_gain: 0,
    negative_information_gain: 0,
    average_evidence: 0,
    question_cost: 1.0, // Base default cost
    connected_diseases: [],
    // Internal accumulator
    _total_evidence: 0
  });

  // Track Body Systems
  if (sym.body_system) {
    const bsId = toId(sym.body_system);
    if (!nodes.BodySystem.has(bsId)) {
      nodes.BodySystem.set(bsId, { id: bsId, name: sym.body_system });
    }
    edges.push({
      source: symId,
      target: bsId,
      source_type: "Symptom",
      target_type: "BodySystem",
      relationship_type: "BELONGS_TO"
    });
    if (!bodySystemLookup.has(bsId)) bodySystemLookup.set(bsId, []);
    bodySystemLookup.get(bsId).push(symId);
  }

  // Aliases
  for (const alias of sym.aliases) {
    const aliasId = toId(alias);
    nodes.Alias.set(aliasId, { id: aliasId, name: alias });
    edges.push({
      source: aliasId,
      target: symId,
      source_type: "Alias",
      target_type: "Symptom",
      relationship_type: "ALIAS_OF"
    });
    aliasLookup.set(aliasId, symId);
  }
}

// B. Extract Diseases and Disease-Symptom Links
for (const dataset of diseaseDatasets) {
  const specialtyName = dataset.specialty;
  const specialtyId = toId(specialtyName);
  
  if (!nodes.Specialty.has(specialtyId)) {
    nodes.Specialty.set(specialtyId, { id: specialtyId, name: specialtyName });
  }

  for (const disease of dataset.diseases) {
    // Avoid double counting shared diseases
    const diseaseId = toId(disease.disease_name);
    if (nodes.Disease.has(diseaseId)) {
      // Add the secondary specialty link
      edges.push({
        source: specialtyId,
        target: diseaseId,
        source_type: "Specialty",
        target_type: "Disease",
        relationship_type: "HAS_DISEASE"
      });
      if (!specialtyLookup.has(specialtyId)) specialtyLookup.set(specialtyId, []);
      specialtyLookup.get(specialtyId).push(diseaseId);
      continue; 
    }

    totalDiseases++;

    // Base Disease Node
    const dNode = {
      id: diseaseId,
      name: disease.disease_name,
      specialty: disease.specialty,
      hallmark_symptoms: [],
      common_symptoms: [],
      uncommon_symptoms: [],
      rare_symptoms: [],
      symptom_count: 0,
      average_evidence: 0,
      prior_probability: null, // Uniform for now
      // Demographics placeholders
      seasonality: null,
      age_group: null,
      sex: null,
      geography: null,
      // Internal
      _total_evidence: 0
    };

    edges.push({
      source: specialtyId,
      target: diseaseId,
      source_type: "Specialty",
      target_type: "Disease",
      relationship_type: "HAS_DISEASE"
    });
    
    if (!specialtyLookup.has(specialtyId)) specialtyLookup.set(specialtyId, []);
    specialtyLookup.get(specialtyId).push(diseaseId);

    const seenSymptomsForDisease = new Set();
    // Process Symptoms
    for (const s of disease.symptoms) {
      const symId = toId(s.normalized_symptom);
      
      if (!nodes.Symptom.has(symId)) {
        console.warn(`WARNING: Disease ${diseaseId} references unknown symptom ${symId}`);
        continue;
      }

      if (seenSymptomsForDisease.has(symId)) {
        continue; // Prevent duplicate HAS_SYMPTOM edge for the same canonical symptom
      }
      seenSymptomsForDisease.add(symId);

      const symNode = nodes.Symptom.get(symId);
      
      dNode.symptom_count++;
      dNode._total_evidence += (s.evidence_count || 0);
      
      symNode.coverage_count++;
      symNode._total_evidence += (s.evidence_count || 0);
      symNode.connected_diseases.push(diseaseId);

      // Distribute into frequency arrays
      const freq = s.frequency || "unknown";
      if (freq === "hallmark") {
        dNode.hallmark_symptoms.push(symId);
        if (!hallmarkIndex.has(symId)) hallmarkIndex.set(symId, []);
        hallmarkIndex.get(symId).push(diseaseId);
      } else if (freq === "common" || freq === "very_common") {
        dNode.common_symptoms.push(symId);
      } else if (freq === "uncommon") {
        dNode.uncommon_symptoms.push(symId);
      } else if (freq === "rare") {
        dNode.rare_symptoms.push(symId);
      }

      // Track Indexes
      if (!symptomToDiseases.has(symId)) symptomToDiseases.set(symId, []);
      symptomToDiseases.get(symId).push(diseaseId);
      
      if (!diseaseToSymptoms.has(diseaseId)) diseaseToSymptoms.set(diseaseId, []);
      diseaseToSymptoms.get(diseaseId).push(symId);

      if (!frequencyIndex.has(symId)) frequencyIndex.set(symId, {});
      const fMap = frequencyIndex.get(symId);
      if (!fMap[freq]) fMap[freq] = [];
      fMap[freq].push(diseaseId);

      // Create HAS_SYMPTOM Edge
      edges.push({
        source: diseaseId,
        target: symId,
        source_type: "Disease",
        target_type: "Symptom",
        relationship_type: "HAS_SYMPTOM",
        properties: {
          frequency: s.frequency,
          severity: s.severity,
          onset_stage: s.onset_stage,
          evidence_sources: s.evidence_sources || [],
          evidence_count: s.evidence_count || 0
        }
      });
    }

    // Finalize Disease Averages
    if (dNode.symptom_count > 0) {
      dNode.average_evidence = +(dNode._total_evidence / dNode.symptom_count).toFixed(2);
    }
    delete dNode._total_evidence;
    
    nodes.Disease.set(diseaseId, dNode);
  }
}

// C. Convert Ontology Edges to Typed Semantic Edges
// Hierarchy -> SPECIALIZATION_OF / GENERALIZATION_OF
for (const e of ontology.hierarchy_edges) {
  const pId = toId(e.parent);
  const cId = toId(e.child);
  if (nodes.Symptom.has(pId) && nodes.Symptom.has(cId)) {
    // Child is a specialization of Parent
    edges.push({
      source: cId,
      target: pId,
      source_type: "Symptom",
      target_type: "Symptom",
      relationship_type: "SPECIALIZATION_OF"
    });
    // Parent is a generalization of Child
    edges.push({
      source: pId,
      target: cId,
      source_type: "Symptom",
      target_type: "Symptom",
      relationship_type: "GENERALIZATION_OF"
    });
  }
}

// Relationships -> CO_OCCURS_WITH (or SEMANTICALLY_SIMILAR if needed, but the ontology gave them as clinical co-occurrence)
for (const e of ontology.relationship_edges) {
  const aId = toId(e.symptom_a);
  const bId = toId(e.symptom_b);
  if (nodes.Symptom.has(aId) && nodes.Symptom.has(bId)) {
    edges.push({
      source: aId,
      target: bId,
      source_type: "Symptom",
      target_type: "Symptom",
      relationship_type: "CO_OCCURS_WITH"
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. COMPUTE INFORMATION GAIN & SYMPTOM METRICS
// ─────────────────────────────────────────────────────────────────────────────

const log2 = x => (x > 0 ? Math.log2(x) : 0);

// Base entropy of the disease space assuming uniform prior
const H_prior = log2(totalDiseases);

for (const sym of nodes.Symptom.values()) {
  if (sym.coverage_count > 0) {
    sym.average_evidence = +(sym._total_evidence / sym.coverage_count).toFixed(2);
  }
  delete sym._total_evidence;

  sym.coverage_percentage = +((sym.coverage_count / totalDiseases) * 100).toFixed(2);

  const count_yes = sym.coverage_count;
  const count_no = totalDiseases - count_yes;

  // Information Gain via Shannon Entropy
  // H(System | YES) = log2(count_yes)
  // H(System | NO) = log2(count_no)
  const H_yes = log2(count_yes);
  const H_no = log2(count_no);

  const p_yes = count_yes / totalDiseases;
  const p_no = count_no / totalDiseases;

  sym.positive_information_gain = +(H_prior - H_yes).toFixed(4);
  sym.negative_information_gain = +(H_prior - H_no).toFixed(4);
  
  // Total Expected Information Gain
  sym.information_gain = +(H_prior - (p_yes * H_yes + p_no * H_no)).toFixed(4);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BUILD INDEXES
// ─────────────────────────────────────────────────────────────────────────────

const symptomIndex = Array.from(nodes.Symptom.values());
symptomIndex.sort((a, b) => a.id.localeCompare(b.id));

const coverageIndex = [...symptomIndex].sort((a, b) => b.coverage_count - a.coverage_count).map(s => s.id);
const informationGainIndex = [...symptomIndex].sort((a, b) => b.information_gain - a.information_gain).map(s => s.id);

// ─────────────────────────────────────────────────────────────────────────────
// 6. VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const validationErrors = [];
let hasCritical = false;

function validate() {
  // A. No orphan nodes
  const connectedNodes = new Set();
  edges.forEach(e => {
    connectedNodes.add(e.source);
    connectedNodes.add(e.target);
  });

  const checkOrphans = (map, type) => {
    for (const key of map.keys()) {
      if (!connectedNodes.has(key)) {
        validationErrors.push(`Orphan ${type}: ${key}`);
      }
    }
  };
  checkOrphans(nodes.Disease, "Disease");
  checkOrphans(nodes.Symptom, "Symptom");
  checkOrphans(nodes.Alias, "Alias");

  // B. Every disease belongs to a specialty
  for (const d of nodes.Disease.values()) {
    if (!d.specialty) validationErrors.push(`Disease ${d.id} has no specialty.`);
  }

  // C. Every disease has symptoms
  for (const d of nodes.Disease.values()) {
    if (d.symptom_count === 0) validationErrors.push(`Disease ${d.id} has no symptoms.`);
  }

  // D. Duplicate edges
  const edgeSet = new Set();
  for (const e of edges) {
    const key = `${e.source}->${e.relationship_type}->${e.target}`;
    if (edgeSet.has(key)) {
      validationErrors.push(`Duplicate Edge: ${key}`);
    }
    edgeSet.add(key);
  }

  hasCritical = validationErrors.length > 0;
}

validate();

// ─────────────────────────────────────────────────────────────────────────────
// 7. STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

const avgDiseaseDegree = +(edges.filter(e => e.source_type === "Disease").length / totalDiseases).toFixed(2);
const avgSymptomDegree = +(edges.filter(e => e.target_type === "Symptom" || e.source_type === "Symptom").length / nodes.Symptom.size).toFixed(2);

const mostConnectedSymptoms = [...nodes.Symptom.values()]
  .sort((a, b) => b.connected_diseases.length - a.connected_diseases.length)
  .slice(0, 10).map(s => s.id);

const leastConnectedSymptoms = [...nodes.Symptom.values()]
  .sort((a, b) => a.connected_diseases.length - b.connected_diseases.length)
  .slice(0, 10).map(s => s.id);

const topIgSymptoms = informationGainIndex.slice(0, 20);
const topRarestSymptoms = [...symptomIndex].sort((a, b) => a.coverage_count - b.coverage_count).slice(0, 20).map(s => s.id);
const topCommonSymptoms = coverageIndex.slice(0, 20);

const graphStats = {
  total_nodes: nodes.Disease.size + nodes.Symptom.size + nodes.Alias.size + nodes.Specialty.size + nodes.BodySystem.size,
  total_edges: edges.length,
  node_breakdown: {
    diseases: nodes.Disease.size,
    symptoms: nodes.Symptom.size,
    aliases: nodes.Alias.size,
    specialties: nodes.Specialty.size,
    body_systems: nodes.BodySystem.size
  },
  validation: {
    status: hasCritical ? "FAIL" : "PASS",
    errors: validationErrors
  }
};

const reasoningMetrics = {
  total_diseases: totalDiseases,
  total_symptoms: nodes.Symptom.size,
  total_aliases: nodes.Alias.size,
  total_graph_edges: edges.length,
  average_disease_degree: avgDiseaseDegree,
  average_symptom_degree: avgSymptomDegree,
  most_connected_symptoms: mostConnectedSymptoms,
  least_connected_symptoms: leastConnectedSymptoms,
  top_20_highest_information_gain_symptoms: topIgSymptoms,
  top_20_rarest_symptoms: topRarestSymptoms,
  top_20_most_common_symptoms: topCommonSymptoms
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. OUTPUT WRITER
// ─────────────────────────────────────────────────────────────────────────────

function writeJson(filename, obj) {
  fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(obj, null, 2), "utf-8");
}

const mapToObject = map => Object.fromEntries(map);

// Full Graph
writeJson("reasoning_graph.json", {
  schema_version: "4.0.0",
  generated_at: new Date().toISOString(),
  nodes: {
    diseases: Array.from(nodes.Disease.values()),
    symptoms: Array.from(nodes.Symptom.values()),
    aliases: Array.from(nodes.Alias.values()),
    specialties: Array.from(nodes.Specialty.values()),
    body_systems: Array.from(nodes.BodySystem.values()),
  },
  edges: edges
});

// Individual files
writeJson("graph_nodes.json", {
  diseases: Array.from(nodes.Disease.values()),
  symptoms: Array.from(nodes.Symptom.values()),
  aliases: Array.from(nodes.Alias.values()),
  specialties: Array.from(nodes.Specialty.values()),
  body_systems: Array.from(nodes.BodySystem.values()),
});
writeJson("graph_edges.json", edges);

// Indexes
writeJson("symptom_index.json", mapToObject(symptomToDiseases));
writeJson("disease_index.json", mapToObject(diseaseToSymptoms));
writeJson("alias_index.json", mapToObject(aliasLookup));
writeJson("specialty_index.json", mapToObject(specialtyLookup));
writeJson("body_system_index.json", mapToObject(bodySystemLookup));
writeJson("hallmark_index.json", mapToObject(hallmarkIndex));
writeJson("frequency_index.json", mapToObject(frequencyIndex));
writeJson("coverage_index.json", coverageIndex);
writeJson("information_gain_index.json", informationGainIndex);

// Metrics
writeJson("graph_statistics.json", graphStats);
writeJson("reasoning_metrics.json", reasoningMetrics);

// ─────────────────────────────────────────────────────────────────────────────
// 9. CONSOLE OUTPUT
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n✅  Reasoning Graph Construction Complete.`);
console.log(`    Total Nodes            : ${graphStats.total_nodes}`);
console.log(`    Total Edges            : ${graphStats.total_edges}`);
console.log(`    Validation Status      : ${graphStats.validation.status}`);
if (hasCritical) {
  for (const e of validationErrors) console.log(`      - ${e}`);
}
console.log(`    Avg Disease Degree     : ${avgDiseaseDegree}`);
console.log(`    Avg Symptom Degree     : ${avgSymptomDegree}`);
console.log(`    Top Information Gain   : ${topIgSymptoms.slice(0,3).join(", ")} ...`);
console.log(`    Output Directory       : ${OUT_DIR}\n`);

