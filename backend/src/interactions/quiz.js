const quizSessionService = require('../services/quizSessionService');

/**
 * Quiz interaction handler
 */
const quiz = {
  /**
   * Build results payload for quiz slides
   * @param {Object} slide - The slide document
   * @param {Array} responses - Array of response documents
   * @returns {Object} - Results payload
   */
  buildResults: (slide, responses) => {
    const slideId = slide._id || slide.id;
    
    // Try to get live session results first
    const sessionResults = quizSessionService.getResults(slideId);
    
    // If we have session results, use them
    if (sessionResults && sessionResults.totalResponses > 0) {
      return {
        quizState: {
          results: sessionResults
        }
      };
    }
    
    // Otherwise, build from stored responses
    const optionCounts = {};
    let correctCount = 0;
    let incorrectCount = 0;
    let totalResponseTime = 0;
    
    responses.forEach((response) => {
      if (response.answer) {
        optionCounts[response.answer] = (optionCounts[response.answer] || 0) + 1;
      }
      
      if (response.isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
      
      if (response.responseTime) {
        totalResponseTime += response.responseTime;
      }
    });
    
    const totalResponses = responses.length;
    const averageResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 0;
    
    return {
      quizState: {
        results: {
          totalResponses,
          optionCounts,
          correctCount,
          incorrectCount,
          averageResponseTime: Math.round(averageResponseTime)
        }
      }
    };
  }
};

module.exports = quiz;
