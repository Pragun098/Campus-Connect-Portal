const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// 3. API ROUTES (CRUD from project PDF)

// GET: Fetch all notes from MongoDB
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }); // Queries MongoDB
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: 'Invalid Note ID' });
  }
});

// POST: Save a new note into MongoDB
router.post('/', async (req, res) => {
  try {
    const newNote = await Note.create({
      text: req.body.text
    });
    res.status(201).json(newNote); // Sends saved document back to frontend
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Update an existing note
router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true, runValidators: true }
    );
    if (!updatedNote) return res.status(404).json({ error: 'Note not found' });
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted successfully', note: deletedNote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
