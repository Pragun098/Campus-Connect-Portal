/**
 * Activity Controller
 * Manages in-memory CRUD operations for Campus Connect Activities
 */

// In-memory data store for Campus Activities (seeded with initial campus data)
let activities = [
  {
    id: 1,
    title: "Welcome Event",
    category: "Orientation",
    date: "2026-10-25",
    status: "Completed",
    createdAt: "2026-10-20T09:00:00.000Z"
  },
  {
    id: 2,
    title: "Programming Workshop",
    category: "Technical",
    date: "2026-11-02",
    status: "Upcoming",
    createdAt: "2026-10-21T10:30:00.000Z"
  },
  {
    id: 3,
    title: "Campus Hackathon 2026",
    category: "Competition",
    date: "2026-11-15",
    status: "Upcoming",
    createdAt: "2026-10-22T14:15:00.000Z"
  }
];

// Helper to generate next unique sequential ID
let nextId = 4;

const editableFields = ['title', 'category', 'date', 'status'];

const getActivityId = (value) => {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const validateActivity = (body, requiredFields = []) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  for (const field of editableFields) {
    const isPresent = Object.prototype.hasOwnProperty.call(body, field);

    if (requiredFields.includes(field) && !isPresent) {
      return `'${field}' is required.`;
    }

    if (
      isPresent &&
      (typeof body[field] !== 'string' || body[field].trim() === '')
    ) {
      return `'${field}' must be a non-empty string.`;
    }
  }

  return null;
};

/**
 * @desc   Get all activities
 * @route  GET /api/activities
 * @access Public
 */
const getAllActivities = (req, res) => {
  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
};

/**
 * @desc   Get single activity by ID
 * @route  GET /api/activities/:id
 * @access Public
 */
const getActivityById = (req, res) => {
  const id = getActivityId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: 'Activity ID must be a positive integer.'
    });
  }

  const activity = activities.find((item) => item.id === id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: `Activity with ID ${req.params.id} not found`
    });
  }

  res.status(200).json({
    success: true,
    data: activity
  });
};

/**
 * @desc   Create a new activity
 * @route  POST /api/activities
 * @access Public
 */
const createActivity = (req, res) => {
  const validationError = validateActivity(req.body, ['title']);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: `Validation Error: ${validationError}`
    });
  }

  const { title, category, date, status } = req.body;
  const newActivity = {
    id: nextId++,
    title: title.trim(),
    category: category === undefined ? 'General' : category.trim(),
    date: date === undefined ? new Date().toISOString().slice(0, 10) : date.trim(),
    status: status === undefined ? 'Upcoming' : status.trim(),
    createdAt: new Date().toISOString()
  };

  activities.push(newActivity);

  res.status(201).json({
    success: true,
    message: "Activity created successfully",
    data: newActivity
  });
};

/**
 * @desc   Update an existing activity
 * @route  PUT /api/activities/:id
 * @access Public
 */
const saveActivity = (req, res, partial) => {
  const id = getActivityId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: 'Activity ID must be a positive integer.'
    });
  }

  const activityIndex = activities.findIndex((item) => item.id === id);
  if (activityIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Activity with ID ${req.params.id} not found`
    });
  }

  const validationError = validateActivity(
    req.body,
    partial ? [] : editableFields
  );
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: `Validation Error: ${validationError}`
    });
  }

  if (partial && !editableFields.some((field) => Object.hasOwn(req.body, field))) {
    return res.status(400).json({
      success: false,
      message: 'At least one activity field must be provided.'
    });
  }

  const changes = Object.fromEntries(
    editableFields
      .filter((field) => Object.hasOwn(req.body, field))
      .map((field) => [field, req.body[field].trim()])
  );
  const existingActivity = activities[activityIndex];
  const updatedActivity = {
    ...existingActivity,
    ...changes,
    updatedAt: new Date().toISOString()
  };

  activities[activityIndex] = updatedActivity;

  res.status(200).json({
    success: true,
    message: `Activity with ID ${id} updated successfully`,
    data: updatedActivity
  });
};

const updateActivity = (req, res) => saveActivity(req, res, false);

/**
 * @desc   Partially update an existing activity
 * @route  PATCH /api/activities/:id
 * @access Public
 */
const patchActivity = (req, res) => saveActivity(req, res, true);

/**
 * @desc   Delete an activity
 * @route  DELETE /api/activities/:id
 * @access Public
 */
const deleteActivity = (req, res) => {
  const id = getActivityId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: 'Activity ID must be a positive integer.'
    });
  }

  const activityIndex = activities.findIndex((item) => item.id === id);

  if (activityIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Activity with ID ${req.params.id} not found`
    });
  }

  const deletedActivity = activities.splice(activityIndex, 1)[0];

  res.status(200).json({
    success: true,
    message: `Activity with ID ${id} deleted successfully`,
    data: deletedActivity
  });
};

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  patchActivity,
  deleteActivity
};
