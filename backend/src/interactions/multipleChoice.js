// Handlers for multiple_choice interaction

function buildResults(slide, responses) {
  const voteCounts = {};
  (slide.options || []).forEach(option => {
    voteCounts[option] = 0;
  });
  responses.forEach(r => {
    // Handle both string and array answers
    const answer = Array.isArray(r.answer) ? r.answer[0] : r.answer;
    if (voteCounts[answer] !== undefined) {
      voteCounts[answer]++;
    }
  });
  return { voteCounts };
}

function normalizeAnswer(answer, slide) {
  const val = typeof answer === 'string' ? answer : (Array.isArray(answer) ? answer[0] : '');
  const trimmed = String(val).trim();
  if (!trimmed) throw new Error('Please select an answer');
  if (Array.isArray(slide.options) && !slide.options.includes(trimmed)) {
    throw new Error('Invalid option');
  }
  return trimmed;
}

module.exports = { buildResults, normalizeAnswer };