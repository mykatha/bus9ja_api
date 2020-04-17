const errorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, next) => {
    let error = { ...err};

    error.message = err.message;

    //log to console fro dev
    console.log(err);
    // Mongoose bad objectid
    if (err.name === 'CasError') {
        const message = `Resource not found`;
        error = new errorResponse(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value enterd';
        error = new errorResponse(message, 400);
    }

    // Mongoose viladation error
    if (err.name === 'validationError') {
        const message = object.values(err.errors).map(val => val.message);
        error = new errorResponse(message, 400);
    }
    resizeBy.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};
module.exports = errorHandler;