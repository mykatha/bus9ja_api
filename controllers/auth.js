const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');


// @desc Resgister user
// @route POST /api/v2/auth/register
// @access Public
exports.regiseter = asyncHandler(async (req, res, next) => {
    const { name, email, password, role} = req.body;

    // Create User
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    sendTokenResponse(user, 200, res);
});
// @desc Login user
// @route POST /api/v2/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password} = req.body;
    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('please provide an invalid email and password', 400))
    }

    // Check for user
    const user = await User.findOne({ eamil}).select('+password');
    if (!user) {
        return next(ErrorResponse('invalid credential', 401));

    }
    //check if password matches
    const ismatch = await user.matchPassword(password);
    if (!ismatch) {
        return next(new ErrorResponse('invalid credential', 401));
    }
    sendTokenResponse(user, 200, res);
    
});

// @desc log user out / clear cokies
// @route GET /api/v2/auth/logout
// @access Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cokies('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: {}
    });
});

//@desc Get current logged in user
// @route  POST /api/v2/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc Update user details
// @route PUT /api/v2/updatedetals
// @access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldToUpdate = {
        name: req.body.name,
        email: req.body.email

    };
    const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: user
    });

});
// @desc Update password
// @route PUT /api/v2/auth/updatepassword
// @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // check current Password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401))
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
});
// @desc Forgot password
// @route POST /api/v2/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) =>{
    const user = await User.findOne({ email: req.body.email});
    
    if (!user) {
        return next(new ErrorResponse('There is no user with the email', 404));
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    //Create reset url
    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/v2/auth/resetpassword/${resetToken}`;
    const message = `You are recieving this email because you or someone else 
    have requested to reset the password. please make a PUT request to:
    \n\n${resetUrl}`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Password reset Token',
            message
        });
        res.status(200).json({
            success: true, data: 'Email sent'
        });
    } catch (err) {
        console.log(err);
        user.ResetPasswordToken = undefined;
        user.ResetPasswordToken = undefined;

        await user.save({ validateBeforeSave: false});
        return next(new ErrorResponse('Email could not be sent', 500))
    }
    res.status(200).json({
        success: true,
        data: user
    });
});
// @desc Reset Password
// @rout PUT/api/v2/auth/resetpassword/:reset token
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //Get hashed token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

    const user = await User.FindOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now()}
    });
    if (!user) {
        return next(new ErrorResponse('Invalid token', 400))
    }
    //Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});
//Get token from model, create cookies and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create token
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIES * 24 * 60 *60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res
     .status(statusCode)
     .cookies('token', token, options)
     .json({
         success: true,
         token

         
     });
};