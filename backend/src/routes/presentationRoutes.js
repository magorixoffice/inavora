const express = require('express');
const router = express.Router();
const presentationController = require('../controllers/presentationController');
const { verifyToken } = require('../middleware/auth');
const { checkSlideLimit } = require('../middleware/checkPlanLimits');


// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/presentations
 * @desc    Create a new presentation
 * @access  Private
 */
router.post('/', presentationController.createPresentation);

/**
 * @route   GET /api/presentations
 * @desc    Get all presentations for the logged-in user
 * @access  Private
 */
router.get('/', presentationController.getUserPresentations);

/**
 * @route   GET /api/presentations/:id
 * @desc    Get a single presentation by ID with all slides
 * @access  Private
 */
router.get('/:id', presentationController.getPresentationById);

/**
 * @route   PUT /api/presentations/:id
 * @desc    Update presentation
 * @access  Private
 */
router.put('/:id', presentationController.updatePresentation);

/**
 * @route   DELETE /api/presentations/:id
 * @desc    Delete presentation and all its slides
 * @access  Private
 */
router.delete('/:id', presentationController.deletePresentation);

/**
 * @route   GET /api/presentations/:id/results
 * @desc    Get all presentations results for given presentation ID
 * @access  Private
 */
router.get('/:id/results', presentationController.getPresentationResultById);

/**
 * @route   POST /api/presentations/:presentationId/slides
 * @desc    Create a new slide in a presentation
 * @access  Private
 */

// Middleware to check slide limit before creating a new slide
router.post('/:presentationId/slides', checkSlideLimit, presentationController.createSlide);

/**
 * @route   PUT /api/presentations/:presentationId/slides/:slideId
 * @desc    Update a slide
 * @access  Private
 */
router.put('/:presentationId/slides/:slideId', presentationController.updateSlide);

/**
 * @route   DELETE /api/presentations/:presentationId/slides/:slideId
 * @desc    Delete a slide
 * @access  Private
 */
router.delete('/:presentationId/slides/:slideId', presentationController.deleteSlide);

/**
 * @route   POST /api/presentations/:presentationId/quiz/:slideId/leaderboard
 * @desc    Create leaderboard slide for a quiz
 * @access  Private
 */
router.post('/:presentationId/quiz/:slideId/leaderboard', presentationController.createLeaderboardForQuiz);

/**
 * @route   GET /api/presentations/:presentationId/leaderboard
 * @desc    Get current leaderboard for presentation
 * @access  Private
 */
router.get('/:presentationId/leaderboard', presentationController.getLeaderboard);

/**
 * @route   POST /api/presentations/:presentationId/generate-leaderboards
 * @desc    Generate leaderboard slides for all quizzes with responses
 * @access  Private
 */
router.post('/:presentationId/generate-leaderboards', presentationController.generateLeaderboards);

/**
 * @route   PUT /api/presentations/:presentationId/qna/:questionId/status
 * @desc    Toggle QnA question status
 * @access  Private
 */
router.put('/:presentationId/qna/:questionId/status', presentationController.toggleQnaStatus);

module.exports = router;
