const Presentation = require('../models/Presentation');
const Slide = require('../models/Slide');
const Response = require('../models/Response');
const leaderboardService = require('../services/leaderboardService');
const quizScoringService = require('../services/quizScoringService');
const { createSlide, updateSlide, deleteSlide } = require('./slideController.js')

/**
 * Create a new presentation
 */
const createPresentation = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.userId;

    // Validate input
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Presentation title is required' });
    }

    // Generate unique access code
    let accessCode;
    let isUnique = false;

    while (!isUnique) {
      accessCode = Presentation.generateAccessCode();
      const existing = await Presentation.findOne({ accessCode });
      if (!existing) isUnique = true;
    }

    // Create presentation
    const presentation = new Presentation({
      userId,
      title: title.trim(),
      accessCode,
      isLive: false,
      currentSlideIndex: 0,
      showResults: true
    });

    await presentation.save();

    res.status(201).json({
      message: 'Presentation created successfully',
      presentation: {
        id: presentation._id,
        title: presentation.title,
        accessCode: presentation.accessCode,
        isLive: presentation.isLive,
        currentSlideIndex: presentation.currentSlideIndex,
        createdAt: presentation.createdAt,
        updatedAt: presentation.updatedAt
      }
    });
  } catch (error) {
    console.error('Create presentation error:', error);
    res.status(500).json({ error: 'Failed to create presentation' });
  }
};

/**
 * Get all presentations for the logged-in user
 */
const getUserPresentations = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    const presentations = await Presentation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    // Get slide count for each presentation
    const presentationsWithSlideCount = await Promise.all(
      presentations.map(async (presentation) => {
        const slideCount = await Slide.countDocuments({ presentationId: presentation._id });
        return {
          id: presentation._id,
          title: presentation.title,
          accessCode: presentation.accessCode,
          isLive: presentation.isLive,
          currentSlideIndex: presentation.currentSlideIndex,
          showResults: presentation.showResults,
          slideCount,
          createdAt: presentation.createdAt,
          updatedAt: presentation.updatedAt
        };
      })
    );

    res.status(200).json({
      presentations: presentationsWithSlideCount,
      total: presentations.length
    });
  } catch (error) {
    console.error('Get presentations error:', error);
    res.status(500).json({ error: 'Failed to fetch presentations' });
  }
};

/**
 * Get a single presentation by ID
 */
const getPresentationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const presentation = await Presentation.findOne({ _id: id, userId });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    // Get all slides for this presentation
    const slides = await Slide.find({ presentationId: id })
      .sort({ order: 1 })
      .select('-__v');

    res.status(200).json({
      presentation: {
        id: presentation._id,
        title: presentation.title,
        accessCode: presentation.accessCode,
        isLive: presentation.isLive,
        currentSlideIndex: presentation.currentSlideIndex,
        showResults: presentation.showResults,
        createdAt: presentation.createdAt,
        updatedAt: presentation.updatedAt
      },
      slides: slides.map(slide => ({
        id: slide._id,
        order: slide.order,
        type: slide.type,
        question: slide.question,
        options: slide.options,
        minValue: slide.minValue,
        maxValue: slide.maxValue,
        minLabel: slide.minLabel,
        maxLabel: slide.maxLabel,
        statements: slide.statements,
        rankingItems: slide.rankingItems,
        hundredPointsItems: slide.hundredPointsItems,
        gridItems: slide.gridItems,
        gridAxisXLabel: slide.gridAxisXLabel,
        gridAxisYLabel: slide.gridAxisYLabel,
        gridAxisRange: slide.gridAxisRange,
        maxWordsPerParticipant: slide.maxWordsPerParticipant,
        openEndedSettings: slide.openEndedSettings,
        qnaSettings: slide.qnaSettings,
        guessNumberSettings: slide.type === 'guess_number'
          ? (slide.guessNumberSettings || { minValue: 1, maxValue: 10, correctAnswer: 5 })
          : slide.guessNumberSettings,
        pinOnImageSettings: slide.pinOnImageSettings,
        quizSettings: slide.quizSettings,
        leaderboardSettings: slide.leaderboardSettings,
        textContent: slide.textContent,
        imageUrl: slide.imageUrl,
        imagePublicId: slide.imagePublicId,
        videoUrl: slide.videoUrl,
        instructionContent: slide.instructionContent,
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get presentation error:', error);
    res.status(500).json({ error: 'Failed to fetch presentation' });
  }
};


const getPresentationResultById = async (req, res) => {
  try {
    console.log("req for result");
    const { id } = req.params;
    console.log(id);
    const userId = req.userId;

    // Verify presentation ownership
    const presentation = await Presentation.findOne({ _id: id, userId });
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    // Get all slides
    const slides = await Slide.find({ presentationId: id }).sort({ order: 1 });

    // Get all responses for this presentation
    const responses = await Response.find({ presentationId: id });

    // Aggregate results by slide
    const results = {};

    for (const slide of slides) {
      const slideResponses = responses.filter(r => r.slideId.toString() === slide._id.toString());
      const totalResponses = slideResponses.length;

      let slideResult = {
        slideId: slide._id,
        type: slide.type,
        totalResponses
      };

      switch (slide.type) {
        case 'multiple_choice':
          const voteCounts = {};
          if (slide.options) {
            slide.options.forEach(opt => voteCounts[opt] = 0);
          }
          slideResponses.forEach(r => {
            if (voteCounts[r.answer] !== undefined) {
              voteCounts[r.answer]++;
            }
          });
          slideResult.voteCounts = voteCounts;
          break;

        case 'word_cloud':
          const wordFrequencies = {};
          slideResponses.forEach(r => {
            const words = Array.isArray(r.answer) ? r.answer : [r.answer];
            words.forEach(word => {
              if (word) {
                const normalizedWord = word.toLowerCase().trim();
                wordFrequencies[normalizedWord] = (wordFrequencies[normalizedWord] || 0) + 1;
              }
            });
          });
          slideResult.wordFrequencies = wordFrequencies;
          break;

        case 'scales':
          const scaleDistribution = {};
          const scaleStatements = slide.statements || [];
          const statementCounts = new Array(scaleStatements.length).fill(0);
          const statementSums = new Array(scaleStatements.length).fill(0);

          slideResponses.forEach(r => {
            if (typeof r.answer === 'object' && r.answer !== null) {
              Object.entries(r.answer).forEach(([statementIndex, value]) => {
                const idx = parseInt(statementIndex);
                if (!isNaN(idx) && idx < scaleStatements.length) {
                  // Track distribution
                  if (!scaleDistribution[idx]) scaleDistribution[idx] = {};
                  scaleDistribution[idx][value] = (scaleDistribution[idx][value] || 0) + 1;

                  // Track sums for averages
                  statementSums[idx] += value;
                  statementCounts[idx]++;
                }
              });
            }
          });

          const scaleStatementAverages = statementSums.map((sum, idx) =>
            statementCounts[idx] > 0 ? sum / statementCounts[idx] : 0
          );

          const totalSum = statementSums.reduce((a, b) => a + b, 0);
          const totalCount = statementCounts.reduce((a, b) => a + b, 0);
          const scaleOverallAverage = totalCount > 0 ? totalSum / totalCount : 0;

          slideResult.scaleDistribution = scaleDistribution;
          slideResult.scaleStatementAverages = scaleStatementAverages;
          slideResult.scaleOverallAverage = scaleOverallAverage;
          slideResult.statementCounts = statementCounts;
          slideResult.scaleStatements = scaleStatements;
          break;

        case 'ranking':
          const rankingResults = slide.rankingItems ? slide.rankingItems.map(item => ({
            id: item.id,
            label: item.label,
            score: 0
          })) : [];

          slideResponses.forEach(r => {
            if (Array.isArray(r.answer)) {
              r.answer.forEach((itemId, index) => {
                // Borda count method: higher rank (lower index) gets more points
                // Points = (number of items - index)
                const points = (slide.rankingItems?.length || 0) - index;
                const item = rankingResults.find(i => i.id === itemId);
                if (item) {
                  item.score += points;
                }
              });
            }
          });
          // Sort by score descending
          rankingResults.sort((a, b) => b.score - a.score);
          slideResult.rankingResults = rankingResults;
          break;

        case 'hundred_points':
          const hundredPointsResults = slide.hundredPointsItems ? slide.hundredPointsItems.map(item => ({
            id: item.id,
            label: item.label,
            totalPoints: 0,
            averagePoints: 0
          })) : [];

          slideResponses.forEach(r => {
            // Handle array format: [{ item: 'uuid', points: 20 }, ...]
            if (Array.isArray(r.answer)) {
              r.answer.forEach(entry => {
                if (entry && entry.item) {
                  const item = hundredPointsResults.find(i => i.id === entry.item);
                  if (item) {
                    item.totalPoints += (parseInt(entry.points) || 0);
                  }
                }
              });
            }
            // Handle object format: { 'uuid': 20 }
            else if (typeof r.answer === 'object' && r.answer !== null) {
              Object.entries(r.answer).forEach(([itemId, points]) => {
                const item = hundredPointsResults.find(i => i.id === itemId);
                if (item) {
                  item.totalPoints += (parseInt(points) || 0);
                }
              });
            }
          });

          hundredPointsResults.forEach(item => {
            item.averagePoints = totalResponses > 0 ? item.totalPoints / totalResponses : 0;
          });

          slideResult.hundredPointsResults = hundredPointsResults;
          break;

        case 'open_ended':
          slideResult.responses = slideResponses.map(r => ({
            id: r._id,
            text: r.answer,
            participantName: r.participantName,
            submittedAt: r.submittedAt,
            votes: r.voteCount || 0
          }));
          break;

        case 'qna':
          slideResult.questions = slideResponses.map(r => ({
            id: r._id,
            text: r.answer,
            participantName: r.participantName,
            submittedAt: r.submittedAt,
            upvotes: r.voteCount || 0,
            isAnswered: r.isAnswered || false
          }));
          break;

        case 'guess_number':
          const guessDistribution = {};
          slideResponses.forEach(r => {
            let val = r.answer;
            // Handle array input (take first element)
            if (Array.isArray(val) && val.length > 0) {
              val = val[0];
            }
            guessDistribution[val] = (guessDistribution[val] || 0) + 1;
          });
          slideResult.distribution = guessDistribution;
          break;

        case '2x2_grid':
          // Aggregate grid positions
          const gridResults = [];
          slideResponses.forEach(r => {
            if (Array.isArray(r.answer)) {
              // Multiple items per user: [{ item: 'uuid', x: 5, y: 5 }, ...]
              r.answer.forEach(item => {
                gridResults.push({
                  participantName: r.participantName,
                  x: item.x,
                  y: item.y,
                  itemId: item.item
                });
              });
            } else if (r.answer && typeof r.answer === 'object') {
              // Single item
              gridResults.push({
                participantName: r.participantName,
                x: r.answer.x,
                y: r.answer.y,
                itemId: r.answer.itemId
              });
            }
          });
          slideResult.gridResults = gridResults;
          break;

        case 'pin_on_image':
          const pinResults = slideResponses.map(r => ({
            participantName: r.participantName,
            x: r.answer.x,
            y: r.answer.y
          }));
          slideResult.pinResults = pinResults;
          break;

        case 'quiz':
          // Calculate quiz statistics
          let correctCount = 0;
          const quizState = {
            results: {} // optionId -> count
          };

          if (slide.quizSettings?.options) {
            slide.quizSettings.options.forEach(opt => {
              quizState.results[opt.id] = 0;
            });
          }

          slideResponses.forEach(r => {
            if (r.isCorrect) correctCount++;
            if (quizState.results[r.answer] !== undefined) {
              quizState.results[r.answer]++;
            }
          });

          slideResult.quizState = quizState;
          slideResult.correctCount = correctCount;
          slideResult.accuracy = totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0;
          break;

        case 'leaderboard':
          // Leaderboard data is usually calculated dynamically or stored separately
          // We can fetch the leaderboard summary here
          try {
            const leaderboardData = await buildLeaderboardSummary({
              presentationId: id,
              limit: slide.leaderboardSettings?.displayCount || 10
            });

            // If it's a linked leaderboard, filter for that
            if (slide.leaderboardSettings?.linkedQuizSlideId) {
              const linkedId = slide.leaderboardSettings.linkedQuizSlideId.toString();
              const specificBoard = leaderboardData.perQuizLeaderboards.find(b => b.quizSlideId === linkedId);
              slideResult.leaderboard = specificBoard ? specificBoard.leaderboard : [];
            } else {
              slideResult.leaderboard = leaderboardData.finalLeaderboard;
            }
          } catch (err) {
            console.error('Error building leaderboard for result:', err);
            slideResult.leaderboard = [];
          }
          break;

        case 'pick_answer':
          // Same handling as multiple_choice
          const pickAnswerVoteCounts = {};
          if (slide.options) {
            slide.options.forEach(opt => pickAnswerVoteCounts[opt] = 0);
          }
          slideResponses.forEach(r => {
            if (pickAnswerVoteCounts[r.answer] !== undefined) {
              pickAnswerVoteCounts[r.answer]++;
            }
          });
          slideResult.voteCounts = pickAnswerVoteCounts;
          break;

        case 'type_answer':
          // Same handling as open_ended
          slideResult.responses = slideResponses.map(r => ({
            id: r._id,
            text: r.answer,
            participantName: r.participantName,
            submittedAt: r.submittedAt,
            votes: r.voteCount || 0
          }));
          break;
        
        // "Bring Your Slides In" slide types - no additional processing needed
        case 'miro':
        case 'powerpoint':
        case 'google_slides':
        case 'upload':
          // These slide types don't have complex results, just show total responses
          // The totalResponses field is already set above
          break;
      }

      results[slide._id] = slideResult;
    }

    res.status(200).json(results);

  } catch (err) {
    console.error('Get presentation result error:', err);
    return res.status(500).json({ error: "Failed to fetch presentation result" });
  }
};

/**
 * Update presentation
 */
const updatePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, showResults } = req.body;

    const presentation = await Presentation.findOne({ _id: id, userId });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    // Update fields
    if (title !== undefined) presentation.title = title.trim();
    if (showResults !== undefined) presentation.showResults = showResults;

    await presentation.save();

    res.status(200).json({
      message: 'Presentation updated successfully',
      presentation: {
        id: presentation._id,
        title: presentation.title,
        accessCode: presentation.accessCode,
        isLive: presentation.isLive,
        currentSlideIndex: presentation.currentSlideIndex,
        showResults: presentation.showResults,
        updatedAt: presentation.updatedAt
      }
    });
  } catch (error) {
    console.error('Update presentation error:', error);
    res.status(500).json({ error: 'Failed to update presentation' });
  }
};

/**
 * Delete presentation
 */
const deletePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify presentation ownership - only owner can delete
    const presentation = await Presentation.findOne({ _id: id, userId });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found or you do not have permission to delete it' });
    }

    // Cascading delete: Delete all related data
    // 1. Delete all responses associated with this presentation
    const Response = require('../models/Response');
    await Response.deleteMany({ presentationId: id });

    // 2. Delete all slides associated with this presentation
    await Slide.deleteMany({ presentationId: id });

    // 3. Delete the presentation itself
    await Presentation.deleteOne({ _id: id });

    res.status(200).json({ message: 'Presentation and all related data deleted successfully' });
  } catch (error) {
    console.error('Delete presentation error:', error);
    res.status(500).json({ error: 'Failed to delete presentation' });
  }
};

/**
 * Create leaderboard slide for a quiz
 */
const createLeaderboardForQuiz = async (req, res) => {
  try {
    const { presentationId, slideId } = req.params;

    // Verify presentation ownership
    const presentation = await Presentation.findOne({
      _id: presentationId,
      userId: req.user.id
    });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    // Verify quiz slide exists
    const quizSlide = await Slide.findOne({
      _id: slideId,
      presentationId,
      type: 'quiz'
    });

    if (!quizSlide) {
      return res.status(404).json({ error: 'Quiz slide not found' });
    }

    // Create leaderboard
    const leaderboard = await leaderboardService.createLeaderboardSlide({
      presentationId,
      quizSlideId: slideId,
      quizSlideOrder: quizSlide.order
    });

    res.status(201).json({
      message: 'Leaderboard created successfully',
      leaderboard
    });
  } catch (error) {
    console.error('Create leaderboard error:', error);
    res.status(500).json({ error: 'Failed to create leaderboard' });
  }
};

/**
 * Get leaderboard for presentation
 */
const buildLeaderboardSummary = async ({ presentationId, limit = 10 }) => {
  const quizSlides = await Slide.find({ presentationId, type: 'quiz' })
    .select('_id question order')
    .sort({ order: 1 })
    .lean();

  const { leaderboardsBySlide, finalLeaderboard } = await quizScoringService.getCumulativeLeaderboards(
    presentationId,
    quizSlides,
    limit
  );

  const perQuizLeaderboards = quizSlides.map((quiz) => {
    const board = leaderboardsBySlide[quiz._id.toString()] || [];
    return {
      quizSlideId: quiz._id.toString(),
      leaderboard: board
    };
  });

  return {
    perQuizLeaderboards,
    finalLeaderboard
  };
};

const getLeaderboard = async (req, res) => {
  try {
    const { presentationId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Verify presentation ownership
    const presentation = await Presentation.findOne({
      _id: presentationId,
      userId: req.user.id
    });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    const { perQuizLeaderboards, finalLeaderboard } = await buildLeaderboardSummary({
      presentationId,
      limit,
    });

    res.status(200).json({
      finalLeaderboard,
      perQuizLeaderboards,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

/**
 * Generate leaderboard slides for all quizzes with responses
 */
const generateLeaderboards = async (req, res) => {
  try {
    const { presentationId } = req.params;

    // Verify presentation ownership
    const presentation = await Presentation.findOne({
      _id: presentationId,
      userId: req.user.id
    });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    const leaderboards = await leaderboardService.createLeaderboardsForPresentation(presentationId);

    res.status(200).json({
      message: `Created ${leaderboards.length} leaderboard slide(s)`,
      leaderboards
    });
  } catch (error) {
    console.error('Generate leaderboards error:', error);
    res.status(500).json({ error: 'Failed to generate leaderboards' });
  }
};

/**
 * Toggle QnA question status (answered/unanswered)
 */
const toggleQnaStatus = async (req, res) => {
  try {
    const { presentationId, questionId } = req.params;
    const { isAnswered } = req.body;
    const userId = req.userId;

    // Verify presentation ownership
    const presentation = await Presentation.findOne({ _id: presentationId, userId });
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    const response = await Response.findOneAndUpdate(
      { _id: questionId, presentationId },
      { $set: { isAnswered } },
      { new: true }
    );

    if (!response) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({
      message: 'Status updated successfully',
      question: {
        id: response._id,
        isAnswered: response.isAnswered
      }
    });
  } catch (error) {
    console.error('Toggle QnA status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

module.exports = {
  createPresentation,
  getUserPresentations,
  getPresentationById,
  getPresentationResultById,
  updatePresentation,
  deletePresentation,
  createSlide,
  updateSlide,
  deleteSlide,
  createLeaderboardForQuiz,
  getLeaderboard,
  generateLeaderboards,
  toggleQnaStatus
};
