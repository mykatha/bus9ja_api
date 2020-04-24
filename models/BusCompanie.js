const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');


const BusCompanieSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'please add a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Nme not to be 50 characters']
        },
        slug: String,
        desciption: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be more than 500 characters']
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                'please use a valid URL with HTTP or UTTPS'
            ]
        },
        phone: {
            type: String,
            maxlength: [20, 'phone number not longer than 20 characters']
        },
        email: {
            type: String,
            match: [
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'please add a valid email'
            ]
        },

        address: {
            type: String,
            required: [true, 'Please add an address']
        },
        location: {
            //GeoJSON Point
            type: {
                type: String,
                enum:['Point']
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            },
            formattedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String,
            country: String
        },
        destinations: {
            //Arrays of Strings
            type: [String],
            required: true,
             enum: [ 
                'Lagos to Abuja',
                'Abuja to Lagos',
                'Lagos to Onitisha',
                'Onitsha to Lagos',
                'Lagos to Enugu',
                'Enugu to Lagos',
                'Lagos to porthacourt',
                'Porthacourt to Lagos',
                'Lagos to Calabar',
                'Calabar to Lagos',
                'Lagos to Uyo',
                'Uyo Lagos',
                'Lagos to Bayelsa',
                'Bayelsa to Lagos',
                'Lagos to Owerri',
                'Owerri to Lagos',
                'Lagos to Aba',
                'Aba to Lagos',
                'Lagos to Abakaliki',
                'Abakaliki to Lagos',
                'Lagos to Benue',
                'Benue to Lagos',
                'Enugu to Abuja',
                'Abuja to Enugu',
                'Aba to Abuja',
                'Abuja to Aba',
                'Onitsha to Abuja',
                'Abuja to Onitsha',
                'Owerri to Abuja',
                'Abuja to Owerri',
                'Porthacourt to Abuja',
                'Abuja to portharcourt',
                'Bayelsa to Abuja',
                'Abuja to Bayelsa',
                'Uyo to Abuja',
                'Abuja to Uyo'

            ]
        },
        avarageRating: {
           type: Number,
           min: [1, 'Rating must be at least 1' ],
           max: [10, ' Rating can not be more than 10']
        },
        averageCost: Number,
        photo: {
            type: String,
            default: 'no-photo.jpg'
        },
        
        safety: {
            type: Boolean,
            default: false
        },
        comfort: {
            type: Boolean,
            default: false
        },
        customerService: {
            type: Boolean,
            default: false
        },
        security: {
            type: Boolean,
            default: false
        },
        driving: {
            type: Boolean,
            default: false
        },
        luggageSpace: {
            type: Boolean,
            default: false
        },
        entertainment: {
            type: Boolean,
            default: false
        },
        refreshment: {
            type: Boolean,
            default: false
        },
        aircondition: {
            type: Boolean,
            default: false
        },
        createdAt:{
            type: Date,
            default: Date.now
        },
        user: {
          type: mongoose.Schema.Objectid,
          ref: 'User',
          required: true
        }
    },
    {
        toJSON: { virtuals: true},
        toObject: {virtuals: true}
    }
);
// creat busCompanie slug from the name
BusCompanieSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true});
    next();
});
// Geocode & create location field
BusCompanieSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    };
    // Do not save address in the DB
    this.address = undefined;
    next();
});

// Cascade delete courses when a BusCompanie is Deleted
BusCompanieSchema.pre('remove', async function(next) {
    console.log(`Trips being removed from the busCompanie ${this._id}`);
    await this.model('Trips').deleteMany({buscompanie: this._id});
    next();
});

// Reverse populate with virtuals
BusCompanieSchema.vitual('trips', {
    ref: 'Trip',
    localField: '_id',
    foreignField: 'busCompanie',
    justOne: false
});
module.exports = mongoose.model('BusCompanie', BusCompanieSchema);