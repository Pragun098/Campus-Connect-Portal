const mongoose = require('mongoose');

// 2. DEFINE A SCHEMA & MODEL (Blueprint for data from project PDF)
const noteSchema = new mongoose.Schema({
  text: { type: String, required: true }
}, {
  timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
