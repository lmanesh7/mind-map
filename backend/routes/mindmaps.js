const express = require('express');
const MindMap = require('../models/MindMap');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all mind maps for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user.userId };
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const mindmaps = await MindMap.find(query).sort({ updatedAt: -1 }).select('-nodes -edges');
    res.json({ success: true, data: mindmaps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a specific mind map
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const mindmap = await MindMap.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!mindmap) {
      return res.status(404).json({ success: false, message: 'Mind map not found' });
    }
    res.json({ success: true, data: mindmap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new mind map
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, nodes, edges } = req.body;
    
    const newMindMap = new MindMap({
      userId: req.user.userId,
      title,
      nodes: nodes || [],
      edges: edges || [],
    });
    
    await newMindMap.save();
    res.json({ success: true, data: newMindMap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update an existing mind map
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, nodes, edges } = req.body;
    
    const mindmap = await MindMap.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, nodes, edges },
      { new: true }
    );

    if (!mindmap) {
      return res.status(404).json({ success: false, message: 'Mind map not found' });
    }

    res.json({ success: true, data: mindmap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a mind map
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const mindmap = await MindMap.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    
    if (!mindmap) {
      return res.status(404).json({ success: false, message: 'Mind map not found or unauthorized' });
    }

    res.json({ success: true, message: 'Mind map deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
