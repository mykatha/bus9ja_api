const ErrorResponse = require('../utils/errorResponse');
const asynHandler = require('../middleware/async');
const trip = require('..models/Trip');
const BusCompanie = require('../models/busCompanie');

// desc Get trips
// @route GET /api/v2/trips
// @route GET /apiv2/busCompanies/:busCompanieid/trips
// @access Public

exports.getTrips = asyncHandler(async (req, res, next) => {
    if (req.params.busCompanieId) {
        const trips = await Trip.find({busCompanie: req.params.busCompanieId })
        return res.status(200).json({
            success: true,
            count: trips.lenght,
            data: trips
        })
    }else {
        res.status(200).json(res.advancedResults);
    }
    
});

// @desc Get single trip
// @route GET /apiv2/trips/:id
// @access public

exports.getTrips = asynHandler(async (req, res, next) => {
    const trip = await Trip.findById(req.params.id).populate({
        path: 'busCompanie',
        select: 'name description'
    });

    if (!trip) {
        return next (
            new ErrorResponse(`No trip with the id of ${req.params.id}`),
            404
        );
    } 
    res.status(200).json({
        success: true,
        data: trip
    });
});

// @desc Add Trip
// @route POST /api/v2/busCompanies/:busCompanieid/trips
// @access Private
exports.addTrip = asynHandler(async (req, res, next) => {
    req.body.busCompanie = req.params.busCompanieId;
    req.body.user = req.user.id;

    const busCompanie = await BusCompanie.findById(req.params.busCompanieId);
    if (!busCompanie) {
        return next (
            new ErrorResponse(`No busCompanie with id of ${req.params.busCompanieId}`),
            404
        );
    }

    // Make sure user is busCompanie owner
    if (busCompanie.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add a trip to busCompanie
                ${busCompanie._id}`, 401
            )
        );
    }
    const trip = await Trip.create(req.body);

    res.status(200).json({
         success: true,
         data: trip
    });
    
});

// @update  Update course
// @route PUT /api/v2/trips/:id
// @access Private

exports.updateTrip = asynHandler(async (req, res, next) => {
    let trip = await Trip.findById(req.params.id);

    if (!trip){
        return next (
            new ErrorResponse(` No trip with the id of
            ${req.params.id}`),
            404
        );

    }
// Make sure user is trip owner
if (trip.user.toString() !== req.user.id && req.user.role
!== 'admin') {
    return next(
        new ErrorResponse(
            `User ${req.user.id} is not authorized to update trip
            ${trip._id}`, 401
        )
    );
}
trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
});
res.status(200).json({
    success: true,
    data: trip
});
});

// @desc Delete trip
// @route DELETE /\api/v2/trips/:id
// @access Private
exports.deleteTrip = asynHandler(async (req, res, next) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
        return next (
            new ErrorResponse(`No trip with the id of
            ${req.params.id}`), 404
        );
    }

    // make sure user is the trip owner
    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorize to delete trip
                ${trip._id}`, 401
            )
        );
    }
    await trip.remove();
    res.status(200).json({
        success: true,
        data: {}
    });
});



