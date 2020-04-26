const express = require('express');
const {
    getTrips,
    getTrip,
    addTrip,
    updateTrip,
    deleteTrip
} = require('../controllers/trips');
const Trip = require('../models/Trip')
const router = express.Router({margeParams: true});

const advancedResults = require('../middleware/advancedResults');
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