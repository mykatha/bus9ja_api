const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'where do you want to go'],
        maxlength: 100
    },
    to: {
        type: String,
        required: [true, ' Please enter destination']
    },
    from: {
        type: String,
        required: [true, ' please enter your location']
    },

    busCompanyie: {
        type: mongoose.Schema.objectid,
        ref: 'BusCpmpanie',
        required: true
    }
})