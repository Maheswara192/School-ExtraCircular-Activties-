const express = require('express');
const router = express.Router();
const {
    submitApplication,
    getApplications,
    updateApplication,
    deleteApplication
} = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(submitApplication)
    .get(protect, admin, getApplications);

router.route('/:id')
    .put(protect, admin, updateApplication)
    .delete(protect, admin, deleteApplication);

module.exports = router;
