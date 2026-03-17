const express = require('express');
const router = express.Router();
const ImportantQuestion = require('../models/ImportantQuestion');

// @route   GET /api/important-questions
// @desc    Get all important questions
// @access  Public
router.get('/', async (req, res) => {
    try {
        const questions = await ImportantQuestion.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/important-questions/admin
// @desc    Create an important question
// @access  Admin (Simplified for now)
router.post('/admin', async (req, res) => {
    const { title, link } = req.body;

    if (!title || !link) {
        return res.status(400).json({ error: 'Title and link are required' });
    }

    try {
        const newQuestion = new ImportantQuestion({ title, link });
        const question = await newQuestion.save();
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/important-questions/admin/:id
// @desc    Update an important question
// @access  Admin
router.put('/admin/:id', async (req, res) => {
    const { title, link } = req.body;

    try {
        let question = await ImportantQuestion.findById(req.params.id);
        if (!question) return res.status(404).json({ error: 'Question not found' });

        question.title = title || question.title;
        question.link = link || question.link;

        await question.save();
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/important-questions/admin/:id
// @desc    Delete an important question
// @access  Admin
router.delete('/admin/:id', async (req, res) => {
    try {
        const question = await ImportantQuestion.findById(req.params.id);
        if (!question) return res.status(404).json({ error: 'Question not found' });

        await question.deleteOne();
        res.json({ msg: 'Question removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
