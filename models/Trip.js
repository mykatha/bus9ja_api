const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    type: {
        type: String,
        trim: true,
        required: [true, 'Please add a bus title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    finalStop: {
        type: String,
        required: [true, 'Please enter your finalStop']
    },
    busFare: {
        type: Number,
        required: [true, 'Please add a busFare']
    },
    busType: {
        type: String,
        required: [true, 'Please add busType']
    },
    aircondition: {
        type: Boolean,
        default: false
    },
    entertainment: {
        type: Boolean,
        default: false
    },
    food: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    busCompanie: {
        type: mongoose.Schema.ObjectId,
        ref: 'BusCompanie',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

// Static mehod to get average cost
TripSchema.static.getAverageCost = async function(busCompanieId) {
    const obj = await this.aggregate([
        {
            $match: { busCompanie: busCompanieId}
        },
        {
            $group: {
                _id: '$BUSCompanie',
                getAverageCost: { $avg: '$cost'}
            }
        }
    ]);
    try {
        await this.model('BusCompanie').findByIdAndUpdate(busCompanieId, {
            getAverageCost: Math.ceil(obj[0].getAverageCost / 10) * 10
        });

    }catch (err) {
        console.error(err);
    }
};

// Call getAverageCost after save
TripSchema.post('save', function() {
    this.constructor.getAverageCost(this.busCompanie);
});

// Call for averageCost after remove
TripSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.busCompanie);
});

module.exports = mongoose.model('Trip', TripSchema);