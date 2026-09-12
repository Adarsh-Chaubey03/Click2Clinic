const fs = require('fs');
const path = require('path');
const DiagnosticEngine = require('../engine/diagnostic_engine');

const DATA_DIR = path.join(__dirname, '..');
const EVAL_DIR = path.join(DATA_DIR, 'evaluation');

const allCases = JSON.parse(fs.readFileSync(path.join(EVAL_DIR, 'benchmark_cases.json'), 'utf-8'));
// Take a subset for fast robustness check
const cases = allCases.filter(c => c.variant_type === 'typical');

let noiseResults = [];

console.log(`Running robustness/noise sensitivity analysis on ${cases.length} typical cases...`);

// For each case, we'll run it with 20% of true symptoms flipped to 'unknown', and 1 true flipped to 'false' (error)
for (const c of cases) {
  const engine = new DiagnosticEngine(DATA_DIR);
  
  // Inject Noise
  let noisedTrue = [...c.true_symptoms];
  let noisedFalse = [...c.false_symptoms];
  let injectedUnknowns = [];
  
  // Flip 1 true to false (Explicit misdiagnosis by patient)
  if (noisedTrue.length > 0) {
    const errorSym = noisedTrue.pop();
    noisedFalse.push(errorSym);
  }
  
  // Flip 1 true to unknown
  if (noisedTrue.length > 0) {
    const unkSym = noisedTrue.pop();
    injectedUnknowns.push(unkSym);
  }

  // Same logic as standard runner
  c.initial_positive.forEach(s => engine.processInput(s, 'yes')); // Assume initials are correct
  c.initial_negative.forEach(s => engine.processInput(s, 'no'));

  const trueSet = new Set(noisedTrue);
  const falseSet = new Set(noisedFalse);
  const unknownSet = new Set([...c.unknown_symptoms, ...injectedUnknowns]);

  let finalResult = null;
  while (true) {
    const res = engine.runCycle(null);
    if (res.status === "FINAL_DIAGNOSIS") {
      finalResult = res;
      break;
    }
    if (res.status === "ASK_QUESTION") {
      const sId = res.symptom;
      let ans = 'unknown';
      if (trueSet.has(sId)) ans = 'yes';
      else if (falseSet.has(sId)) ans = 'no';
      else if (unknownSet.has(sId)) ans = 'unknown';
      
      engine.recordResponseAndAdvance(sId, ans, res.candidate_count_before);
    }
  }

  const ranks = finalResult.ranked_diseases.map(x => x.disease_id);
  const isCorrectTop1 = ranks[0] === c.true_disease;
  let rr = 0;
  const idx = ranks.findIndex(x => x === c.true_disease);
  if (idx !== -1) rr = 1.0 / (idx + 1);

  noiseResults.push({
    case_id: c.case_id,
    top1: isCorrectTop1,
    mrr: rr
  });
}

const noisedTop1 = +(noiseResults.filter(x => x.top1).length / noiseResults.length).toFixed(4);
const noisedMrr = +(noiseResults.reduce((sum, x) => sum + x.mrr, 0) / noiseResults.length).toFixed(4);

// Load baseline for comparison
const baselineStats = JSON.parse(fs.readFileSync(path.join(EVAL_DIR, 'evaluation_report.json'), 'utf-8'));
const baselineTypical = baselineStats.variant_breakdown['typical'];

const robustnessReport = {
  baseline_typical_top1: baselineTypical.top1_accuracy,
  noised_typical_top1: noisedTop1,
  degradation_top1: +(baselineTypical.top1_accuracy - noisedTop1).toFixed(4),
  baseline_typical_mrr: baselineTypical.mrr,
  noised_typical_mrr: noisedMrr,
  degradation_mrr: +(baselineTypical.mrr - noisedMrr).toFixed(4),
  noise_profile: "1 true flipped to false, 1 true flipped to unknown"
};

fs.writeFileSync(path.join(EVAL_DIR, 'robustness_report.json'), JSON.stringify(robustnessReport, null, 2));
console.log(`✅ Robustness Analysis complete. Top-1 Degradation: ${(robustnessReport.degradation_top1 * 100).toFixed(1)}%`);
