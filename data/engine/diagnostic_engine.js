const path = require('path');
const fs = require('fs');
const SessionManager = require('./session_manager');
const ProbabilityUpdater = require('./probability_updater');
const QuestionSelector = require('./question_selector');

class DiagnosticEngine {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.graphDir = path.join(baseDir, 'reasoning_graph');
    this.config = JSON.parse(fs.readFileSync(path.join(baseDir, 'engine', 'config.json'), 'utf-8'));
    this.sessionManager = new SessionManager(this.graphDir);
    this.probabilityUpdater = new ProbabilityUpdater(this.graphDir, this.config);
    this.questionSelector = new QuestionSelector(this.graphDir, this.config);
  }

  processInput(symptom, response) {
    if (response === 'yes') {
      this.sessionManager.addPositive(symptom);
    } else if (response === 'no') {
      this.sessionManager.addNegative(symptom);
    } else if (response === 'unknown') {
      this.sessionManager.addUnknown(symptom);
    }
  }

  runCycle(traceFilePath) {
    this.sessionManager.recordTraversal();
    
    // 1. Update Probabilities
    const candidates = this.probabilityUpdater.updateProbabilities(this.sessionManager.state);
    const candidateCount = candidates.length;

    // 2. Check Contradiction
    if (this.probabilityUpdater.detectGlobalContradiction(candidates)) {
      return this.generateFinalOutput("CONTRADICTION");
    }

    // 3. Check Stop Conditions
    const questionsAsked = this.sessionManager.state.metrics.questions_asked;
    const probGap = candidateCount > 1 ? (candidates[0].probability - candidates[1].probability) : 1.0;
    
    // Stop if Max Questions Reached
    if (questionsAsked >= this.config.max_questions) {
      return this.generateFinalOutput("MAX_QUESTIONS_REACHED");
    }
    
    // Check adaptive stops only if we've asked minimum questions
    if (questionsAsked >= (this.config.min_questions || 5)) {
      if (candidateCount <= this.config.minimum_candidate_count) {
        return this.generateFinalOutput("MINIMUM_CANDIDATES_REACHED");
      }
      if (candidates[0].probability >= this.config.confidence_threshold) {
        return this.generateFinalOutput("CONFIDENCE_THRESHOLD_REACHED");
      }
      // If gap is large enough AND top candidate has a decent minimum confidence, stop
      if (probGap >= this.config.probability_gap_threshold && candidates[0].probability >= 0.35) {
        return this.generateFinalOutput("PROBABILITY_GAP_REACHED");
      }
    }

    // 4. Select Question
    const nextQ = this.questionSelector.selectNextQuestion(candidates, this.sessionManager);
    
    if (!nextQ || (nextQ.informationGain < (this.config.minimum_useful_gain || 0.05) && questionsAsked >= (this.config.min_questions || 5))) {
      return this.generateFinalOutput("NO_INFORMATIVE_QUESTIONS");
    }

    // 5. Build Trace & Question Object
    const questionData = {
      status: "ASK_QUESTION",
      question: `Do you have ${nextQ.symNode.canonical_name}?`,
      symptom: nextQ.symNode.id,
      reason: `High utility score (${nextQ.utility.toFixed(3)}) with expected information gain of ${nextQ.informationGain.toFixed(3)}.`,
      expected_elimination_if_yes: nextQ.posElim,
      expected_elimination_if_no: nextQ.negElim,
      candidate_count_before: candidateCount,
      candidate_count_after_if_yes: nextQ.dynamicCoverage,
      candidate_count_after_if_no: candidateCount - nextQ.dynamicCoverage
    };

    if (traceFilePath) {
      this.sessionManager.saveSession(traceFilePath);
    }

    return questionData;
  }

  recordResponseAndAdvance(symptom, response, candidateCountBefore) {
    this.processInput(symptom, response);
    // Record into trace
    this.sessionManager.recordQuestion({
      symptom: symptom,
      response: response,
      candidate_count_before: candidateCountBefore,
      timestamp: Date.now()
    });
  }

  generateFinalOutput(stopReason) {
    const candidates = this.sessionManager.state.candidate_diseases;
    let diagnosisStatus = "SUCCESS";
    let explanation = "";

    if (stopReason === "CONTRADICTION") {
      diagnosisStatus = "FAILED_CONTRADICTION";
      explanation = "The provided combination of symptoms is highly inconsistent with all known disease profiles. Medical evaluation is strongly recommended over continuing forced diagnosis.";
    } else {
      explanation = `Diagnosis concluded due to: ${stopReason}. Top candidate is ${candidates[0]?.name} with probability ${(candidates[0]?.probability * 100).toFixed(1)}%.`;
    }

    return {
      status: "FINAL_DIAGNOSIS",
      reason: stopReason,
      diagnosis_status: diagnosisStatus,
      ranked_diseases: candidates.slice(0, 5),
      positive_symptoms: this.sessionManager.state.positive_symptoms,
      negative_symptoms: this.sessionManager.state.negative_symptoms,
      explanation: explanation,
      metrics: this.sessionManager.state.metrics
    };
  }
}

module.exports = DiagnosticEngine;
