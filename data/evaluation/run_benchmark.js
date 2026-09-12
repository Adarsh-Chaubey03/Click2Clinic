const fs = require('fs');
const path = require('path');
const DiagnosticEngine = require('../engine/diagnostic_engine');

const DATA_DIR = path.join(__dirname, '..');
const EVAL_DIR = path.join(DATA_DIR, 'evaluation');

const cases = JSON.parse(fs.readFileSync(path.join(EVAL_DIR, 'benchmark_cases.json'), 'utf-8'));

let results = [];
const startTime = Date.now();

console.log(`Starting benchmark for ${cases.length} cases...`);

let caseNum = 0;
for (const c of cases) {
  caseNum++;
  if (caseNum % 100 === 0) console.log(`Processed ${caseNum}/${cases.length} cases`);

  // We need a fresh engine instance for every case
  const engine = new DiagnosticEngine(DATA_DIR);
  
  // Load initials
  c.initial_positive.forEach(s => engine.processInput(s, 'yes'));
  c.initial_negative.forEach(s => engine.processInput(s, 'no'));

  const trueSet = new Set(c.true_symptoms);
  const falseSet = new Set(c.false_symptoms);
  const unknownSet = new Set(c.unknown_symptoms);
  
  let loopCount = 0;
  let finalResult = null;

  while (true) {
    loopCount++;
    const res = engine.runCycle(null); // Don't write trace to disk for speed

    if (res.status === "FINAL_DIAGNOSIS") {
      finalResult = res;
      break;
    }

    if (res.status === "ASK_QUESTION") {
      // Oracle answers
      const sId = res.symptom;
      let ans = 'unknown';
      if (trueSet.has(sId)) ans = 'yes';
      else if (falseSet.has(sId)) ans = 'no';
      
      engine.recordResponseAndAdvance(sId, ans, res.candidate_count_before);
    }
  }

  // Record outcome
  const topCandidate = finalResult.ranked_diseases.length > 0 ? finalResult.ranked_diseases[0].disease_id : null;
  const isCorrectTop1 = topCandidate === c.true_disease;
  
  // Calculate reciprocal rank
  let rr = 0;
  const idx = finalResult.ranked_diseases.findIndex(x => x.disease_id === c.true_disease);
  if (idx !== -1) rr = 1.0 / (idx + 1);

  results.push({
    case_id: c.case_id,
    true_disease: c.true_disease,
    variant_type: c.variant_type,
    ranked_diseases: finalResult.ranked_diseases.map(x => ({ id: x.disease_id, prob: x.probability })),
    top_1_correct: isCorrectTop1,
    reciprocal_rank: rr,
    questions_asked: finalResult.metrics.questions_asked,
    stop_reason: finalResult.reason,
    confidence: finalResult.ranked_diseases.length > 0 ? finalResult.ranked_diseases[0].probability : 0
  });
}

const duration = Date.now() - startTime;
console.log(`✅ Benchmark complete in ${duration}ms`);

fs.writeFileSync(path.join(EVAL_DIR, 'raw_benchmark_results.json'), JSON.stringify(results, null, 2));
