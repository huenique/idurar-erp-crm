const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['task', 'follow-up', 'call', 'email', 'meeting', 'support', 'other'],
    default: 'task',
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  ticketIds: [{
    type: String, // Appwrite document IDs are strings
  }],
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    autopopulate: { select: 'name' },
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  removed: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

schema.pre('save', function (next) {
  this.updated = Date.now();
  next();
});

schema.pre('findOneAndUpdate', function (next) {
  this.set({ updated: Date.now() });
  next();
});

module.exports = mongoose.model('Interaction', schema);