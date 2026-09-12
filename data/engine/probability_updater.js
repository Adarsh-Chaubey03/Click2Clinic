const fs = require('fs');
const path = require('path');

class ProbabilityUpdater {
  constructor(dataDir, config) {
    this.config = config;
    this.edges = JSON.parse(fs.readFileSync(path.join(dataDir, 'graph_edges.json'), 'utf-8'));
    this.diseaseNodes = JSON.parse(fs.readFileSync(path.join(dataDir, 'graph_nodes.json'), 'utf-8')).diseases;
    this.diseaseIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'disease_index.json'), 'utf-8'));
    
    // Create quick lookup for HAS_SYMPTOM edges
    this.diseaseSymptomEdges = new Map();
    for (const e of this.edges) {
      if (e.relationship_type === 'HAS_SYMPTOM') {
        if (!this.diseaseSymptomEdges.has(e.source)) {
          this.diseaseSymptomEdges.set(e.source, new Map());
        }
        this.diseaseSymptomEdges.get(e.source).set(e.target, e);
      }
    }
  }

  updateProbabilities(sessionState) {
    let candidates = [];
    const { positive_symptoms, negative_symptoms } = sessionState;
    let maxScore = -Infinity;

    for (const d of this.diseaseNodes) {
      const diseaseId = d.id;
      let score = 0;
      let isContradicted = false;
      let eliminationReason = null;
      let matchedSymptoms = [];
      let missingHallmarks = [];
      let contradictingSymptoms = [];

      const symEdges = this.diseaseSymptomEdges.get(diseaseId) || new Map();

      // Check positive symptoms
      for (const posSym of positive_symptoms) {
        if (symEdges.has(posSym)) {
          const edge = symEdges.get(posSym);
          const freq = edge.properties.frequency || 'unknown';
          score += this.config.frequency_weights[freq] || this.config.frequency_weights.unknown;
          matchedSymptoms.push(posSym);
        } else {
          // If a patient has a positive symptom that the disease DEFINITELY DOES NOT HAVE
          // We apply a soft penalty. But wait, if it's explicitly contradictory?
          // The prompt: "Only eliminate a disease when a confirmed contradictory finding or explicit exclusion criterion exists."
          // For now, positive symptoms not belonging to the disease act as a large penalty or contradiction.
          score += this.config.contradiction_threshold_score / 2;
          contradictingSymptoms.push(posSym);
        }
      }

      // Check negative symptoms
      for (const negSym of negative_symptoms) {
        if (symEdges.has(negSym)) {
          const edge = symEdges.get(negSym);
          const freq = edge.properties.frequency || 'unknown';
          
          if (freq === 'hallmark') {
            missingHallmarks.push(negSym);
          }
          score += this.config.penalty_weights[freq] || this.config.penalty_weights.unknown;
        }
      }

      // Base prior could be added here
      score += (d.prior_probability || 0);
      
      // Candidate Recovery: Add back some score if they matched strong symptoms after being penalized
      // E.g., if score is negative but they have matched hallmarks
      if (score < 0 && matchedSymptoms.some(s => {
          const symEdge = symEdges.get(s);
          return symEdge && symEdge.properties.frequency === 'hallmark';
      })) {
          score += 10; // Recovery boost
      }

      // Rule 6: Never eliminate because of one missing hallmark.
      // We will only declare contradiction if missing > 1 hallmark or score is extremely low.
      if (score <= this.config.contradiction_threshold_score || missingHallmarks.length > 1) {
        isContradicted = true;
        eliminationReason = `Score dropped to ${score} or too many missing hallmarks. Contradicting: ${contradictingSymptoms.join(', ')}. Missing Hallmarks: ${missingHallmarks.join(', ')}`;
      }

      if (!isContradicted) {
        candidates.push({
          disease_id: diseaseId,
          name: d.name,
          score: score,
          matched_symptoms: matchedSymptoms,
          missing_hallmarks: missingHallmarks,
          contradicting_symptoms: contradictingSymptoms
        });
        if (score > maxScore) maxScore = score;
      }
    }

    // Rule 7: Contradiction Recovery
    if (candidates.length === 0) {
      // Recovery mode: If all contradicted, relax constraints and don't eliminate
      for (const d of this.diseaseNodes) {
         candidates.push({
           disease_id: d.id,
           name: d.name,
           score: -10, // flat penalty
           matched_symptoms: [], missing_hallmarks: [], contradicting_symptoms: []
         });
      }
    }

    // Convert scores to a pseudo-probability distribution using Temperature Scaling (Rule 8)
    const T = 1.5;
    
    // Shift scores so max is 0 to avoid overflow in exp
    let maxS = candidates.reduce((max, c) => Math.max(max, c.score), -Infinity);
    let expSum = 0;
    
    candidates.forEach(c => {
      c.exp_score = Math.exp((c.score - maxS) / T);
      expSum += c.exp_score;
    });

    candidates.forEach(c => {
      let prob = expSum > 0 ? c.exp_score / expSum : 0;
      
      c.probability = +(prob).toFixed(4);
      delete c.exp_score;
    });

    // Sort by probability desc
    candidates.sort((a, b) => b.probability - a.probability);
    
    sessionState.candidate_diseases = candidates;
    
    // Store snapshot
    sessionState.probability_history.push({
      timestamp: Date.now(),
      top_candidates: candidates.slice(0, 5)
    });
    
    return candidates;
  }

  detectGlobalContradiction(candidates) {
    if (candidates.length === 0) return true;
    if (candidates[0].score <= this.config.contradiction_threshold_score) return true;
    return false;
  }
}

module.exports = ProbabilityUpdater;
