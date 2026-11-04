const express = require('express');
const router = express.Router();
const {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  patchActivity,
  deleteActivity
} = require('../controllers/activityController');

// Routes for /api/activities
router.route('/')
  .get(getAllActivities)
  .post(createActivity);

// Routes for /api/activities/:id
router.route('/:id')
  .get(getActivityById)
  .put(updateActivity)
  .patch(patchActivity)
  .delete(deleteActivity);

module.exports = router;
