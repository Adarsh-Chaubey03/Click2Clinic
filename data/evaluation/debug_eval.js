const fs = require('fs');
const path = require('path');
const DiagnosticEngine = require('../engine/diagnostic_engine');

const DATA_DIR = path.join(__dirname, '..');
const EVAL_DIR = path.join(DATA_DIR, 'evaluation');

const cases = JSON.parse(fs.readFileSync(path.join(EVAL_DIR, 'benchmark_cases.json'), 'utf-8'));

const testCase = cases[0]; // Just take first case
console.log("True Disease:", testCase.true_disease);

const engine = new DiagnosticEngine(DATA_DIR);
testCase.initial_positive.forEach(s => engine.processInput(s, 'yes'));
testCase.initial_negative.forEach(s => engine.processInput(s, 'no'));

const trueSet = new Set(testCase.true_symptoms);
const falseSet = new Set(testCase.false_symptoms);

let finalResult = null;
while (true) {
  const res = engine.runCycle(null);
  console.log("--- Cycle Output ---");
  console.log("Status:", res.status);
  
  if (res.status === "FINAL_DIAGNOSIS") {
    finalResult = res;
    break;
  }

  if (res.status === "ASK_QUESTION") {
    const sId = res.symptom;
    let ans = 'unknown';
    if (trueSet.has(sId)) ans = 'yes';
    else if (falseSet.has(sId)) ans = 'no';
    
    console.log(`Asking: ${sId} -> ${ans}`);
    engine.recordResponseAndAdvance(sId, ans, res.candidate_count_before);
    
    console.log(`Candidates: ${engine.sessionManager.state.candidate_diseases.length}`);
    console.log("Top Candidates:");
    engine.sessionManager.state.candidate_diseases.slice(0, 3).forEach(c => {
        console.log(`  ${c.name}: score=${c.score} prob=${c.probability}`);
    });
  }
}
console.log("Final Top:", finalResult.ranked_diseases.slice(0,3).map(d => d.name));
