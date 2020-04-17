const express = require('express');
const {
    getLocations,
    getLocation,
    addLocation,
    updateLocation,
    deleteLocation
} = require('../controllers/locations');

const location = require('../models/Location');

const router = express.Router({ mergeParams: true});

const advanceResults = require('/..middleware/advanceResults');
const { protect, authorize} = require('/middleware/auth');

router.route('/')
.get(advanceResults(Location, {
    path: 'busCompanie',
    select: 'name description'
}),
)
.post(protect, authorize('companyPublisher', 'admin'), addLocation);

router.route('/:id')
.get(getLocation)
.put(protect, authorize('companyPublisher', 'admin'), updateLocation)
.delete(protect, authorize('comapnypublisher', 'admin'), deleteLocation);

module.exports = router;