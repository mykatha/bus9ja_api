//const path = require('path');
//const ErrorResponse = require('../utils/errorResponse');
//const assyncHandler = require('../middleware/async');
//const geocoder = require('../utils/geocoder');
//const BusCompanie = require('../models/BusCompanie');




// @desc Get all busCompanies
//  @route GET /api/v2/busCompanies
//  @access public


exports.getBusCompanies = (req, res, next) => {
    res.status(200).json({success:true, msg: 'show all busCompanies' });

}
// @desc Get single busCompanie
//  @route GET /api/v2/busCompanies/:id
//  @access public


exports.getBusCompanie = (req, res, next) => {
    res.status(200).json({success:true, msg: `show all busCompanies ${req.params.id}` });

}

// @desc Creat busCompanie
//  @route POST /api/v2/busCompanie
//  @access private(must login and get a token)


exports.createBusCompanie = (req, res, next) => {
    res.status(200).json({success:true, msg: 'show all busCompanies' });

}

// @desc Update busCompanie
//  @route PUT /api/v2/busCompanies/:id
//  @access public


exports.updateBusCompanie = (req, res, next) => {
    res.status(200).json({success:true, msg: `show all busCompanies ${req.params.id}` });

}

// @desc Delete  busCompanie
//  @route DELETE /api/v2/busCompanies/;id
//  @access public


exports.deleteBusCompanie = (req, res, next) => {
    res.status(200).json({success:true, msg: `show all busCompanies ${req.params.id}` });

}