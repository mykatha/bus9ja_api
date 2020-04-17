const mongoose = require('mongoose');
const LocationSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'please choose your location']
    },
    street: {
        type: String,
        required: [true, 'Please add your street']
    },
    city: {
        type: String,
        required: [true, 'Please add a city']
    },
    state: {
        type: String,
        required: [true, 'Please add a state']
    },
    country: {
        type: String,
        required: [true, 'Please add a country']
    },
    zipcode: {
        type: Number,
        min: 5,
        max: 10,
        required: [true, 'Please add a valid zipcode between 5 and 10']
    },
    busCompanie: {
        type: mongoose.Schema.objectid,
        ref: 'BusCompanie',
        required: true
    }, 

    user: {
        type: mongoose.Schema.objectid,
        ref: 'User',
        required: true
    }
});