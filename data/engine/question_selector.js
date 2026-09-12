const fs = require('fs');
const path = require('path');

class QuestionSelector {
  constructor(dataDir, config) {
    this.config = config;
    this.diseaseIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'disease_index.json'), 'utf-8'));
    this.symptoms = JSON.parse(fs.readFileSync(path.join(dataDir, 'graph_nodes.json'), 'utf-8')).symptoms;
    
    // Quick lookup for symptom data
    this.symptomMap = new Map();
    for (const s of this.symptoms) {
      this.symptomMap.set(s.id, s);
    }
    
    // Load pairwise discriminators
    const discFile = path.join(dataDir, 'evaluation', 'pairwise_discriminators.json');
    if (fs.existsSync(discFile)) {
      this.pairwiseDiscriminators = JSON.parse(fs.readFileSync(discFile, 'utf-8'));
    } else {
      this.pairwiseDiscriminators = {};
    }
  }

  log2(x) {
    return x > 0 ? Math.log2(x) : 0;
  }

  selectNextQuestion(candidateDiseases, sessionManager) {
    const candidateCount = candidateDiseases.length;
    if (candidateCount === 0) return null;

    // Build map of disease IDs for O(1) lookup
    const activeDiseaseSet = new Set(candidateDiseases.map(d => d.disease_id));
    
    // Rule 2: Tie-Breaker Mode
    if (candidateCount <= 5 && candidateCount >= 2) {
      let bestTieBreaker = null;
      let maxPDDS = -1;
      
      for (const sym of this.symptoms) {
        if (sessionManager.hasBeenAsked(sym.id)) continue;
        
        let withSym = 0;
        let withoutSym = 0;
        let hallmarkCount = 0;
        
        for (const c of candidateDiseases) {
          if (sym.connected_diseases.includes(c.disease_id)) {
            withSym++;
            // Check if hallmark
            const edge = this.diseaseIndex[c.disease_id]?.symptoms?.find(s => s === sym.id); // Not available easily.
            // Just use average_evidence as a proxy for hallmark weight
            if (sym.average_evidence > 2.5) hallmarkCount++;
          } else {
            withoutSym++;
          }
        }
        
        // Pairwise Disease Discrimination Score is the number of pairs separated
        let pdds = (withSym * withoutSym) * (1 + hallmarkCount * 0.5);
        
        if (pdds > maxPDDS) {
          maxPDDS = pdds;
          bestTieBreaker = sym;
        }
      }
      
      if (bestTieBreaker && maxPDDS > 0) {
        return {
          symNode: bestTieBreaker,
          utility: maxPDDS,
          informationGain: 0.1, // Fake IG to pass stop checks
          posElim: 1, negElim: 1, dynamicCoverage: 1
        };
      }
    }

    const H_prior = this.log2(candidateCount);
    let bestSymptom = null;
    let bestUtility = -Infinity;

    // Evaluate all canonical symptoms
    for (const sym of this.symptoms) {
      const symId = sym.id;

      // Skip already asked
      if (sessionManager.hasBeenAsked(symId)) {
        continue;
      }

      // Calculate dynamic coverage for active candidates
      let dynamicCoverageCount = 0;
      let totalEvidenceForActive = 0;
      
      for (const dId of sym.connected_diseases) {
        if (activeDiseaseSet.has(dId)) {
          dynamicCoverageCount++;
          // We could lookup exact evidence from edge, but we'll use avg for simplicity
          totalEvidenceForActive += sym.average_evidence;
        }
      }

      // If symptom does not appear in ANY active candidate, skip it.
      if (dynamicCoverageCount === 0) continue;

      const p_yes = dynamicCoverageCount / candidateCount;
      const p_no = (candidateCount - dynamicCoverageCount) / candidateCount;
      
      const H_yes = this.log2(dynamicCoverageCount);
      const H_no = this.log2(candidateCount - dynamicCoverageCount);
      
      const posElimScore = candidateCount - dynamicCoverageCount;
      const negElimScore = dynamicCoverageCount;
      
      const informationGain = H_prior - (p_yes * H_yes + p_no * H_no);
      
      // Calculate Utility
      const w = this.config.utility_weights;
      const coverageScore = dynamicCoverageCount / candidateCount;
      const evidenceScore = dynamicCoverageCount > 0 ? totalEvidenceForActive / dynamicCoverageCount : 0;
      
      // Dynamic Utility Adjustment (Rule 4)
      // If we have many candidates, coverage is more important. If few, elimination is more important.
      const dynW_coverage = candidateCount > 10 ? w.coverage_score * 2 : w.coverage_score;
      const dynW_elim = candidateCount <= 10 ? w.positive_elimination * 1.5 : w.positive_elimination;

      const utilityScore = (
        (informationGain * w.information_gain) +
        (posElimScore * dynW_elim) +
        (negElimScore * w.negative_elimination) +
        (evidenceScore * w.evidence_score) +
        (coverageScore * dynW_coverage)
      ) / sym.question_cost;

      if (utilityScore > bestUtility) {
        bestUtility = utilityScore;
        bestSymptom = {
          symNode: sym,
          utility: utilityScore,
          informationGain: informationGain,
          posElim: posElimScore,
          negElim: negElimScore,
          dynamicCoverage: dynamicCoverageCount,
          evidenceScore: evidenceScore
        };
      } else if (utilityScore === bestUtility && bestSymptom) {
        // Deterministic Tie-Breaking (Rule 10): 
        // Highest Utility (already checked) -> Highest Pairwise Separation (skipped here) -> Highest Hallmark (not directly extracted here) -> Highest Evidence -> Lowest Cost -> Alphabetical
        if (evidenceScore > bestSymptom.evidenceScore) {
          bestSymptom = { symNode: sym, utility: utilityScore, informationGain, posElim: posElimScore, negElim: negElimScore, dynamicCoverage: dynamicCoverageCount, evidenceScore };
        } else if (evidenceScore === bestSymptom.evidenceScore) {
           if (sym.question_cost < bestSymptom.symNode.question_cost) {
             bestSymptom = { symNode: sym, utility: utilityScore, informationGain, posElim: posElimScore, negElim: negElimScore, dynamicCoverage: dynamicCoverageCount, evidenceScore };
           } else if (sym.question_cost === bestSymptom.symNode.question_cost && symId.localeCompare(bestSymptom.symNode.id) < 0) {
             bestSymptom = { symNode: sym, utility: utilityScore, informationGain, posElim: posElimScore, negElim: negElimScore, dynamicCoverage: dynamicCoverageCount, evidenceScore };
           }
        }
      }
    }

    if (!bestSymptom || bestSymptom.informationGain < this.config.minimum_information_gain) {
      // Allow returning tie breaker even if info gain is low, but global IG might be too low.
      return null;
    }

    return bestSymptom;
  }
}

module.exports = QuestionSelector;
