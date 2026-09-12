const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..');
const GRAPH_DIR = path.join(DATA_DIR, 'reasoning_graph');
const EVAL_DIR = path.join(DATA_DIR, 'evaluation');

const diseases = JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, 'graph_nodes.json'), 'utf-8')).diseases;
const symptomsList = JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, 'graph_nodes.json'), 'utf-8')).symptoms;
const allSymptomIds = symptomsList.map(s => s.id);

// Deterministic PRNG
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
const rand = mulberry32(42);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const variants = [
  'typical_1', 'typical_2', 'typical_3', 'early_1', 'early_2', 'late_1', 'late_2',
  'mild_1', 'mild_2', 'severe_1', 'severe_2', 'incomplete_1', 'incomplete_2',
  'incomplete_3', 'misleading_1', 'misleading_2', 'overlapping_1', 'overlapping_2',
  'contradictory_1', 'contradictory_2'
];

let cases = [];

for (const d of diseases) {
  const hallmarks = d.hallmark_symptoms || [];
  const commons = d.common_symptoms || [];
  const uncommons = d.uncommon_symptoms || [];
  const rares = d.rare_symptoms || [];

  for (const variant of variants) {
    const c = {
      case_id: `${d.id}_${variant}`,
      true_disease: d.id,
      variant_type: variant.split('_')[0],
      true_symptoms: [],
      false_symptoms: [],
      unknown_symptoms: []
    };

    let basePositives = [];

    // Construct positives
    if (c.variant_type === 'typical') {
      basePositives = [...hallmarks, ...commons];
    } else if (c.variant_type === 'early') {
      basePositives = [...hallmarks.slice(0, Math.max(1, Math.floor(hallmarks.length / 2))), ...commons.slice(0, 2)];
    } else if (c.variant_type === 'late') {
      basePositives = [...hallmarks, ...commons, ...uncommons.slice(0, 1)];
    } else if (c.variant_type === 'mild') {
      basePositives = [...commons, ...uncommons.slice(0, 1)];
    } else if (c.variant_type === 'severe') {
      basePositives = [...hallmarks, ...commons, ...rares.slice(0, 1)];
    } else if (c.variant_type === 'incomplete') {
      basePositives = [...hallmarks, ...commons];
      shuffle(basePositives);
      basePositives = basePositives.slice(0, Math.max(1, Math.floor(basePositives.length * 0.7))); // drop 30%
    } else if (c.variant_type === 'misleading') {
      basePositives = [...hallmarks, ...commons];
      const otherSymptoms = shuffle([...allSymptomIds]).filter(s => !basePositives.includes(s));
      basePositives.push(otherSymptoms[0]); // inject misleading
    } else if (c.variant_type === 'overlapping') {
      basePositives = [...hallmarks, ...commons];
      // get another disease in same specialty
      const sameSpec = diseases.filter(x => x.specialty === d.specialty && x.id !== d.id);
      if (sameSpec.length > 0) {
        const other = sameSpec[Math.floor(rand() * sameSpec.length)];
        basePositives.push(...(other.hallmark_symptoms || []).slice(0, 1));
      }
    } else if (c.variant_type === 'contradictory') {
      basePositives = [...hallmarks, ...commons];
      // explicitly make a hallmark negative
      if (hallmarks.length > 0) {
        const removed = basePositives.shift();
        c.false_symptoms.push(removed);
      }
    }

    c.true_symptoms = [...new Set(basePositives)];

    // Define negative oracle: Any symptom not in the disease profile is negative, unless contradictory
    const allDiseaseSymptoms = new Set([...hallmarks, ...commons, ...uncommons, ...rares]);
    for (const s of allSymptomIds) {
      if (!allDiseaseSymptoms.has(s) && !c.true_symptoms.includes(s) && !c.false_symptoms.includes(s)) {
        // Randomly, a patient might not know, but for standard benchmark, it's false
        c.false_symptoms.push(s);
      }
    }

    // Give them a starting prompt: 2 random positive symptoms, 1 random negative symptom
    const shuffledPos = shuffle([...c.true_symptoms]);
    c.initial_positive = shuffledPos.slice(0, 2);
    
    const shuffledNeg = shuffle([...c.false_symptoms]);
    c.initial_negative = shuffledNeg.slice(0, 1);

    cases.push(c);
  }
}

fs.writeFileSync(path.join(EVAL_DIR, 'benchmark_cases.json'), JSON.stringify(cases, null, 2));
console.log(`✅ Generated ${cases.length} benchmark cases.`);
