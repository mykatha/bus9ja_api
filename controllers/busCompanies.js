const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const BusCompanie = require('../models/BusCompanie');




// @desc Get all busCompanies
//  @route GET /api/v2/busCompanies
//  @access public


exports.getBusCompanies =  asyncHandler(async (req, res, next) => {
   res.status(200).json(res.advancedResults);

});
// @desc Get single busCompanie
//  @route GET /api/v2/busCompanies/:id
//  @access public


exports.getBusCompanie = asyncHandler(async (req, res, next) => {
const busCompanie = await busCompanie.findById(req.params.id);
if (!busCompanie) {
    return next(
        new ErrorResponse(`BusCompanie not found with id of ${req.params.id}`, 400)
    );
    
}
res.status(200).json({success: true, data: busCompanie});

});

// @desc Creat new busCompanie
//  @route POST /api/v2/busCompanie
//  @access private(must login and get a token)


exports.createBusCompanie = asyncHandler( async (req, res, next) => {
    //add user a req,body
    req.body.user = req.user.id;
    
    //check for published busCompanie
    const publishedBusCompanie = await BusCompanie.findOne({ user: req.user.id});
    
    // If the user is not an Admin, they can only add one busCompanie
    if (publishedBusCompanie && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has alread published a busComapnie`,
                400
            )
        );
    }
    const BusCompanie = await BusCompanie.create(req.body);
    res.status(201).json({success:true, data: busCompanie
     });

});

// @desc Update busCompanie
//  @route PUT /api/v2/busCompanies/:id
//  @access public


exports.updateBusCompanie = asyncHandler(async (req, res, next) => {
    let busCompanie = await BusCompanie.findById(req.params.id);

    if (!busCompanie) {
        return next(
            new ErrorResponse(`BusCompanie not found with id
            ${req.params.id}`, 404)
        );
    }
    //Make sure user is busCompanie owner
    if (busCompanie.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this busCompanie`,
                401
            )
        );
    }
    busCompanie = await BusCompanie.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({success: true, data: busCompanie});

});

// @desc Delete  busCompanie
//  @route DELETE /api/v2/busCompanies/;id
//  @access public


exports.deleteBusCompanie = asyncHandler(async (req, res, next) => {
    const busCompanie = await BusCompanie.findById(req.params.id);
    
    if (!busCompanie) {
        return next(
            new ErrorResponse(
                `BusCompanie not found with id of ${req.params.id}`, 404
            )
        );
    }
    //make sure user is busCompanie owner
    if (busCompanie.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to delete busCompanie`,
                401
            )
        );
    }
    busCompanie.remove();

    res.status(200).json({success:true, data: {} });

});

// @desc Get busCompanies within a radius
// @route GET /api/v2/busCompanies/redius/:zipcode/:distance
// @access private
exports.getBusCompaniesInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // Get lat/Lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longtitude;

    // calc redius using redians
    // Divide dist by redius of Earth
    //Earth Radius = 3, 963 mi / 6, 378 km
    const radius = distance / 3963;

    const busCompanies = await BusCompanie.find({
        location: {$geoWithin: { $centerSphere: [[lng, lat], radius]}}
    });
    res.status(200).json
    ({ success: true, 
        count: busCompanie.lenght,
         data: busCompanies
        });
});

//@desc Upload photo for busCompanie
//@raute PUT /api/v2/busCompanies/:id/photo
//@access Private
exports.busCompaniePhotoUpload = asyncHandler(async (req, res, next) => {
    const busCompanie = await BusCompanie.findById(req.params.id);

    if (!busCompanie) {
        return next(
            new ErrorResponse(
                `BusCompanie not found with the id of ${req.params.id}`, 404
            )
        );
    }
    //Make sure user is busCompanie owner
    if (busCompanie.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorize to update this busCompanie`,
                401
            )
        );
    }
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }
    const file = req.files.file;
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload image file`, 400))
    }

    // check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }
    //Create custom filename
    file.name = `photo_${busCompanie._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
        console.error(err);
        return next(new ErrorResponse(
            `Problem with file upload`, 500
        ));

        }
        await BusCompanie.findByIdAndUpdate(req.params.id, {photo: file.name });
        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});