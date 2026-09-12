const path = require('path');
const DiagnosticEngine = require('./engine/diagnostic_engine');

const DATA_DIR = __dirname;
const TRACE_FILE = path.join(DATA_DIR, 'diagnostic_trace.json');

// We simulate a patient who has Influenza
// hallmark: sudden onset of fever, severe muscle pain, extreme tiredness (fatigue)
// common: dry cough, sore throat, headache, chills
const patientTrueSymptoms = new Set([
  'fever',
  'fatigue',
  'muscle pain',
  'cough',
  'sore throat',
  'headache',
  'chills'
]);

// Initial user input
const initialPositive = ['fever', 'headache'];
const initialNegative = ['skin rash'];

const engine = new DiagnosticEngine(DATA_DIR);

// Inject initial
for (const s of initialPositive) engine.processInput(s, 'yes');
for (const s of initialNegative) engine.processInput(s, 'no');

console.log("=== ARDRE Simulation Start ===");
console.log(`Initial Positives: ${initialPositive.join(', ')}`);
console.log(`Initial Negatives: ${initialNegative.join(', ')}\n`);

let turn = 1;
while (true) {
  const result = engine.runCycle(TRACE_FILE);
  
  if (result.status === "FINAL_DIAGNOSIS") {
    console.log(`\n=== FINAL DIAGNOSIS ===`);
    console.log(`Reason: ${result.reason}`);
    console.log(`Status: ${result.diagnosis_status}`);
    console.log(`Explanation: ${result.explanation}`);
    console.log(`\nTop Candidates:`);
    result.ranked_diseases.forEach((d, i) => {
      console.log(`  ${i+1}. ${d.name} (Prob: ${(d.probability * 100).toFixed(1)}%)`);
      console.log(`     Matched: ${d.matched_symptoms.join(', ')}`);
      if (d.missing_hallmarks.length > 0) {
        console.log(`     Missing Hallmarks: ${d.missing_hallmarks.join(', ')}`);
      }
    });
    break;
  }
  
  if (result.status === "ASK_QUESTION") {
    console.log(`Turn ${turn}: ${result.question}`);
    console.log(`  Reason: ${result.reason}`);
    console.log(`  Expected Candidates (Y/N): ${result.candidate_count_after_if_yes} / ${result.candidate_count_after_if_no}`);
    
    // Simulate user answering deterministically based on our truth set
    const answer = patientTrueSymptoms.has(result.symptom) ? 'yes' : 'no';
    console.log(`  User answers: ${answer.toUpperCase()}\n`);
    
    engine.recordResponseAndAdvance(result.symptom, answer, result.candidate_count_before);
    turn++;
  }
}
