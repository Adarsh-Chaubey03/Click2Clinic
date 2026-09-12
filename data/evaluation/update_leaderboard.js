const fs = require('fs');
const path = require('path');

const EVAL_DIR = __dirname;
const LEADERBOARD_FILE = path.join(EVAL_DIR, 'leaderboard.json');

const metrics = JSON.parse(fs.readFileSync(path.join(EVAL_DIR, 'benchmark_results.json'), 'utf-8'));

let leaderboard = [];
if (fs.existsSync(LEADERBOARD_FILE)) {
  leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf-8'));
}

const entry = {
  timestamp: new Date().toISOString(),
  engine_version: "ARDRE v1.0",
  graph_version: "v4.0.0",
  disease_count: 100,
  symptom_count: 149,
  metrics: {
    top1_accuracy: metrics.top1_accuracy,
    top3_accuracy: metrics.top3_accuracy,
    top5_accuracy: metrics.top5_accuracy,
    mrr: metrics.mrr,
    average_questions_asked: metrics.average_questions_asked,
    average_confidence: metrics.average_confidence
  }
};

leaderboard.push(entry);

fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
console.log(`✅ Leaderboard updated.`);
