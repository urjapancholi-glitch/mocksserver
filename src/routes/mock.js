const express = require('express');
const Mock = require('../models/Mock');
const User = require('../models/User');

const router = express.Router();

// Middleware to ensure User access
const isUser = (req, res, next) => {
    // Decode JWT in real app
    next();
};

const isAdmin = (req, res, next) => {
    // Decode admin JWT
    next();
};


// 1. GET /api/mock - Get all active mocks (User/Admin)
router.get('/', async (req, res) => {
    try {
        // Excluding correctOptionIndex so users can't cheat by looking at payload
        const mocks = await Mock.find({ isActive: true }).select('-questions.correctOptionIndex');
        res.json(mocks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mocks' });
    }
});

// 2. GET /api/mock/admin - Get all mocks including answers (Admin)
router.get('/admin', isAdmin, async (req, res) => {
    try {
        const mocks = await Mock.find();
        res.json(mocks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mocks' });
    }
});

// 3. GET /api/mock/:id - Get a single mock for test taking
router.get('/:id', async (req, res) => {
    try {
        const mock = await Mock.findById(req.params.id);
        if (!mock || !mock.isActive) return res.status(404).json({ error: 'Mock not found' });
        res.json(mock);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching mock details' });
    }
});

// 4. POST /api/mock/admin - Create a new Mock (Admin)
router.post('/admin', isAdmin, async (req, res) => {
    try {
        const mock = new Mock(req.body);
        await mock.save();
        res.json(mock);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create mock' });
    }
});

// 5. PUT /api/mock/admin/:id - Update a mock (Admin)
router.put('/admin/:id', isAdmin, async (req, res) => {
    try {
        const mock = await Mock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mock) return res.status(404).json({ error: 'Mock not found' });

        // Recalculate all affected user scores if marking scheme changes
        const usersToUpdate = await User.find({ "testsTaken.mockId": mock._id });
        for (const user of usersToUpdate) {
            let modified = false;
            user.testsTaken.forEach(test => {
                if (String(test.mockId) === String(mock._id)) {
                    let newScore = 0;
                    let correct = 0;
                    let incorrect = 0;

                    test.answers.forEach(ans => {
                        const question = mock.questions.find(q => String(q._id) === String(ans.questionId));
                        if (question) {
                            if (ans.selectedOption === question.correctOptionIndex) {
                                correct++;
                                newScore += (question.positiveMarks ?? mock.positiveMarks);
                            } else {
                                incorrect++;
                                newScore -= (question.negativeMarks ?? mock.negativeMarks);
                            }
                        }
                    });

                    const unanswered = mock.questions.length - (correct + incorrect);

                    if (test.score !== newScore || test.correct !== correct || test.incorrect !== incorrect || test.unanswered !== unanswered) {
                        test.score = newScore;
                        test.correct = correct;
                        test.incorrect = incorrect;
                        test.unanswered = unanswered;
                        modified = true;
                    }
                }
            });
            if (modified) {
                await user.save();
            }
        }

        res.json(mock);
    } catch (err) {
        console.error('Error updating mock:', err);
        res.status(500).json({ error: 'Failed to update mock' });
    }
});

// 6. DELETE /api/mock/admin/:id - Delete a mock (Admin)
router.delete('/admin/:id', isAdmin, async (req, res) => {
    try {
        await Mock.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete mock' });
    }
});

// 7. POST /api/mock/:id/submit - Submit answers and calculate score
// Assuming JWT middleware adds user ID to req.user._id
router.post('/:id/submit', isUser, async (req, res) => {
    try {
        const mockId = req.params.id;
        const { answers, userId } = req.body; // In real app, userId from req.user._id

        const mock = await Mock.findById(mockId);
        if (!mock) return res.status(404).json({ error: 'Mock not found' });

        let score = 0;
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        let earnedPositivePoints = 0;
        let lostNegativePoints = 0;
        let totalMaxScore = 0;

        const recordedAnswers = [];

        mock.questions.forEach((q, index) => {
            const pMarks = q.positiveMarks ?? mock.positiveMarks;
            const nMarks = q.negativeMarks ?? mock.negativeMarks;
            totalMaxScore += pMarks;

            // Find the user's answer for this question index
            const userAns = answers.find(a => String(a.questionIndex) === String(index));

            if (userAns && typeof userAns.selectedOption === 'number') {
                recordedAnswers.push({ questionId: String(q._id), selectedOption: userAns.selectedOption });

                if (userAns.selectedOption === q.correctOptionIndex) {
                    correct++;
                    score += pMarks;
                    earnedPositivePoints += pMarks;
                } else {
                    incorrect++;
                    score -= nMarks;
                    lostNegativePoints += nMarks;
                }
            } else {
                unanswered++;
            }
        });

        // Save to user profile
        const user = await User.findById(userId);
        if (user) {
            user.testsTaken.push({
                mockId,
                score,
                correct,
                incorrect,
                unanswered,
                answers: recordedAnswers
            });
            await user.save();
        }

        const detailedResults = mock.questions.map((q, index) => {
            const userAns = answers.find(a => String(a.questionIndex) === String(index));
            return {
                questionText: q.text,
                options: q.options,
                correctOptionIndex: q.correctOptionIndex,
                explanation: q.explanation,
                positiveMarks: q.positiveMarks ?? mock.positiveMarks,
                negativeMarks: q.negativeMarks ?? mock.negativeMarks,
                userSelectedOption: userAns && typeof userAns.selectedOption === 'number' ? userAns.selectedOption : null
            };
        });

        res.json({
            message: 'Test submitted successfully',
            result: {
                score,
                correct,
                incorrect,
                unanswered,
                totalQuestions: mock.questions.length,
                positiveMarks: mock.positiveMarks,
                negativeMarks: mock.negativeMarks,
                earnedPositivePoints,
                lostNegativePoints,
                totalMaxScore,
                detailedResults
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit test' });
    }
});

module.exports = router;
