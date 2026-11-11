const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
