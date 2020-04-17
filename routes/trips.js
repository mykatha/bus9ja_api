const express = require('express');
const {
    getTrips,
    getTrip,
    addTrip,
    updateTrip,
    deleteTrip
} = require('../controllers/trips');
const trips = require('../models/trips')
const trip = express.Router({margeParam: true});

const advancedResults = require('../middleware/advancedResultes');
const {protect, authorize} = require('../middleware/auth');

router.route('/')
.get(advancedResults(Trip, {
    path: 'busCompanie',
    select: 'name descriptions'
}),
getTrips
)
.post(protect, authorize('companyPublisher', 'admin'), addTrip);
router
.route('/:id')
.get(getTrip)
.put(protect, authorize('companyPublisher', 'admin'), updateTrip)
.delete(protect, authorize('companyPublisher', 'admin'),deleteTrip)

module.exports = router;