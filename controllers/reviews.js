const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const BusCompanie = require('..models/BusCompanie');

// @desc Get reviews
// @route GET /api/v2/reviews
//@route GET /api/v2/busCompanies/:busCompanieid/reviews
// @access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.busCompanieId) {
        const reviews = await Review.find({ busCompanie: req.params.busCompanieId});

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc Get single review
// @route GET /api/v2/reviews/:id
// @access Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'busCompanie',
        select: 'name description'
    });
    
    if (!review) {
        return next (
            new ErrorResponse(`No review found with id of
            ${req.params.id}`, 404
            )
        );
    }

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc Add review
// @route POST /api/v2/busCompanies/:busCompanie:id/reviews
// :access Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.busCompanie = req.params.busCompanieId;
    req.body.user = req.user.id;
    const busCompanie = await BusCompanie.findById(req.params.busCompanieId)

    if (!busCompanie) {
        return next(
            new ErrorResponse(
                `No busCompanie with the id of
                ${req.params.busCompanieId}`, 404
            )
        );
    }
    const review = await Review.create(req.body);
    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc Update review
// @route PUT /api/v2/review/ :id
// @access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);
    if (!review) {
        return next(
            new ErrorResponse(` No review with the id of 
            ${req.params.id}`, 404)
        );

    }
    //Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`Not authorized to update review`, 401)
        );
    }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc Delete
// @route DELETE /api/v2/reviews/:id
// @access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if(!review) {
        return next (
            new ErrorResponse(`NO review with the id ${req.params.id}`, 404)
        );
    }
    // Make sure reviews belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update review`), 401)
    }
    await review.romove();
    res.status(200).json({
        success: true,
        data: {}
    });
});