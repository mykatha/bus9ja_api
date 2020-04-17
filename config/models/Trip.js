const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please enter the name']
    },
    
     createdAt: {
         type: Date,
         default: Date.now
     },   
    
})