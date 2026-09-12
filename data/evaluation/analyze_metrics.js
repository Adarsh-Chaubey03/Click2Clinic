const fs = require('fs');
const path = require('path');

const EVAL_DIR = __dirname;
const results = JSON.parse(fs.readFileSync(path.join(EVAL_DIR, 'raw_benchmark_results.json'), 'utf-8'));

let top1Correct = 0;
let top3Correct = 0;
let top5Correct = 0;
let mrrSum = 0;
let totalQuestions = 0;
let totalConf = 0;

const confusionMatrix = {};
const failureAnalysis = [];
const variantStats = {};

results.forEach(r => {
  const trueD = r.true_disease;
  const ranks = r.ranked_diseases.map(x => x.id);
  
  if (ranks[0] === trueD) top1Correct++;
  if (ranks.slice(0, 3).includes(trueD)) top3Correct++;
  if (ranks.slice(0, 5).includes(trueD)) top5Correct++;
  
  mrrSum += r.reciprocal_rank;
  totalQuestions += r.questions_asked;
  totalConf += r.confidence;

  // Confusion Matrix
  if (!confusionMatrix[trueD]) confusionMatrix[trueD] = {};
  const pred = ranks[0] || "UNKNOWN";
  confusionMatrix[trueD][pred] = (confusionMatrix[trueD][pred] || 0) + 1;

  // Failure Analysis
  if (ranks[0] !== trueD) {
    failureAnalysis.push({
      case_id: r.case_id,
      true_disease: trueD,
      predicted_disease: pred,
      variant_type: r.variant_type,
      reciprocal_rank: r.reciprocal_rank
    });
  }

  // Variant breakdown
  if (!variantStats[r.variant_type]) {
    variantStats[r.variant_type] = { count: 0, top1: 0, mrr: 0 };
  }
  variantStats[r.variant_type].count++;
  if (ranks[0] === trueD) variantStats[r.variant_type].top1++;
  variantStats[r.variant_type].mrr += r.reciprocal_rank;
});

const totalCases = results.length;

const metrics = {
  total_cases: totalCases,
  top1_accuracy: +(top1Correct / totalCases).toFixed(4),
  top3_accuracy: +(top3Correct / totalCases).toFixed(4),
  top5_accuracy: +(top5Correct / totalCases).toFixed(4),
  mrr: +(mrrSum / totalCases).toFixed(4),
  average_questions_asked: +(totalQuestions / totalCases).toFixed(2),
  average_confidence: +(totalConf / totalCases).toFixed(4)
};

for (const v in variantStats) {
  variantStats[v].top1_accuracy = +(variantStats[v].top1 / variantStats[v].count).toFixed(4);
  variantStats[v].mrr = +(variantStats[v].mrr / variantStats[v].count).toFixed(4);
}

fs.writeFileSync(path.join(EVAL_DIR, 'benchmark_results.json'), JSON.stringify(metrics, null, 2));
fs.writeFileSync(path.join(EVAL_DIR, 'confusion_matrix.json'), JSON.stringify(confusionMatrix, null, 2));
fs.writeFileSync(path.join(EVAL_DIR, 'failure_analysis.json'), JSON.stringify(failureAnalysis, null, 2));
fs.writeFileSync(path.join(EVAL_DIR, 'evaluation_report.json'), JSON.stringify({
  overall_metrics: metrics,
  variant_breakdown: variantStats
}, null, 2));

console.log(`✅ Metrics Analysis complete. Top-1 Accuracy: ${(metrics.top1_accuracy * 100).toFixed(1)}%`);
