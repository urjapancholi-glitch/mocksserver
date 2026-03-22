const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Middleware to ensure Admin access
const isAdmin = (req, res, next) => {
    // Decode admin JWT in real app
    next();
};

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST a new category (Main or Sub)
router.post('/admin', isAdmin, async (req, res) => {
    try {
        const { name, type, parentId } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }
        if (type === 'Sub' && !parentId) {
            return res.status(400).json({ error: 'Subcategories must have a parent ID' });
        }

        const category = new Category({ name, type, parentId: parentId || null });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT (update) a category
router.put('/admin/:id', isAdmin, async (req, res) => {
    try {
        const { name, type, parentId } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, type, parentId: parentId || null },
            { new: true }
        );
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE a category
router.delete('/admin/:id', isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        // If it's a Main category, delete its subcategories too
        if (category.type === 'Main') {
            await Category.deleteMany({ parentId: category._id });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;
