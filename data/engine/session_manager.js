const fs = require('fs');
const path = require('path');

class SessionManager {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.aliasIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'alias_index.json'), 'utf-8'));
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      positive_symptoms: [],
      negative_symptoms: [],
      unknown_symptoms: [],
      question_history: [],
      candidate_diseases: [],
      probability_history: [],
      graph_traversal_path: [],
      metrics: {
        total_graph_traversals: 0,
        start_time: Date.now(),
        average_response_time: 0,
        questions_asked: 0,
        diseases_eliminated_per_question: [],
        probability_convergence: []
      }
    };
  }

  normalizeSymptom(symptom) {
    const raw = symptom.toLowerCase().trim();
    return this.aliasIndex[raw] || raw;
  }

  addPositive(symptom) {
    const canon = this.normalizeSymptom(symptom);
    if (!this.state.positive_symptoms.includes(canon)) {
      this.state.positive_symptoms.push(canon);
    }
  }

  addNegative(symptom) {
    const canon = this.normalizeSymptom(symptom);
    if (!this.state.negative_symptoms.includes(canon)) {
      this.state.negative_symptoms.push(canon);
    }
  }

  addUnknown(symptom) {
    const canon = this.normalizeSymptom(symptom);
    if (!this.state.unknown_symptoms.includes(canon)) {
      this.state.unknown_symptoms.push(canon);
    }
  }

  recordQuestion(traceStep) {
    this.state.question_history.push(traceStep);
    this.state.metrics.questions_asked++;
    
    // Performance metrics
    const beforeCount = traceStep.candidate_count_before || 0;
    const afterCount = traceStep.candidate_count_after || 0;
    this.state.metrics.diseases_eliminated_per_question.push(beforeCount - afterCount);
  }

  recordTraversal() {
    this.state.metrics.total_graph_traversals++;
  }

  hasBeenAsked(symptom) {
    const canon = this.normalizeSymptom(symptom);
    return this.state.positive_symptoms.includes(canon) || 
           this.state.negative_symptoms.includes(canon) || 
           this.state.unknown_symptoms.includes(canon);
  }

  saveSession(filepath) {
    const duration = Date.now() - this.state.metrics.start_time;
    if (this.state.metrics.questions_asked > 0) {
      this.state.metrics.average_response_time = duration / this.state.metrics.questions_asked;
    }
    fs.writeFileSync(filepath, JSON.stringify(this.state, null, 2), 'utf-8');
  }
}

module.exports = SessionManager;
