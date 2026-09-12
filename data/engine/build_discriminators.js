const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..');
const GRAPH_NODES = path.join(DATA_DIR, 'reasoning_graph', 'graph_nodes.json');
const OUT_FILE = path.join(DATA_DIR, 'evaluation', 'pairwise_discriminators.json');

const data = JSON.parse(fs.readFileSync(GRAPH_NODES, 'utf-8'));
const diseases = data.diseases;

// Precompute symptom sets for each disease
const diseaseSymptoms = new Map();
for (const d of diseases) {
  const syms = new Set([
    ...(d.hallmark_symptoms || []),
    ...(d.common_symptoms || []),
    ...(d.uncommon_symptoms || []),
    ...(d.rare_symptoms || [])
  ]);
  diseaseSymptoms.set(d.id, syms);
}

const discriminators = {};

for (let i = 0; i < diseases.length; i++) {
  for (let j = i + 1; j < diseases.length; j++) {
    const d1 = diseases[i].id;
    const d2 = diseases[j].id;
    const sym1 = diseaseSymptoms.get(d1);
    const sym2 = diseaseSymptoms.get(d2);

    const distinguishing = [];
    
    // Find symptoms in D1 not in D2
    for (const s of sym1) {
      if (!sym2.has(s)) {
        // Evaluate weight (hallmarks better)
        let weight = 1;
        if (diseases[i].hallmark_symptoms?.includes(s)) weight = 5;
        else if (diseases[i].common_symptoms?.includes(s)) weight = 3;
        
        distinguishing.push({
          symptom: s,
          favors: d1,
          weight: weight,
          expected_elimination: 1, // Eliminates d2 if yes, d1 if no (softly)
          expected_confidence_increase: 0.5 // From ~0.5 to ~1.0
        });
      }
    }

    // Find symptoms in D2 not in D1
    for (const s of sym2) {
      if (!sym1.has(s)) {
        let weight = 1;
        if (diseases[j].hallmark_symptoms?.includes(s)) weight = 5;
        else if (diseases[j].common_symptoms?.includes(s)) weight = 3;
        
        distinguishing.push({
          symptom: s,
          favors: d2,
          weight: weight,
          expected_elimination: 1,
          expected_confidence_increase: 0.5
        });
      }
    }

    // Sort by weight descending
    distinguishing.sort((a, b) => b.weight - a.weight);

    const pairKey = [d1, d2].sort().join('|');
    discriminators[pairKey] = distinguishing;
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(discriminators, null, 2));
console.log(`Generated pairwise discriminators for ${Object.keys(discriminators).length} disease pairs.`);
