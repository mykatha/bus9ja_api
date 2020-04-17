const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const BusCompanieSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']

    },
    slug: String,
    descripion: {
        type: String,
        required: [true, 'please add a description'],
        trim: true,
        maxlength: [500, 'Descriptionscan not be more than 50 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'please use a valid URL'
        ]
    },
    phone: {
        type: String,
        maxlength: [16, ' phone not more than 13 characters']
    },
    email:{
        type: String,
        match: [
            /\S+@\S+\.\S+/, 'Please adda valide email'
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
            enum: ['point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        },
        formatedAdress: String,
        street: String,
        City: String,
        state: String,
        zipcodes: String,
        country:  String
    },
     destination:{
      type: mongoose.schema.objectid,
      ref: destination,
      descripion: [true, 'Please enter your destinations']
      
     },
     to: {
         type: mongoose.schema.objectid,
         ref: destination
     },

     from:{
         type: mongoose.schema.objectid,
         ref: destination
     },
    trip:{
        type: mongoose.Schema.objectid,
        ref: trip
        
    },
    destinations:{
        type: mongoose.schema.objectid,
        ref: destinations
    },
    buse: {
        type: mongoose.schema.objectid,
        ref: buse
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be atleat 1'],
        max: [10, 'Rating must not be more than 10']
    },
    price: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    comfort: {
        type: Boolean,
        default: false
    },
    safeDriving: {
        type: Boolean,
        default: false
    },
    security: {
        type: Boolean,
        default: false
    },
    luggageSpace: {
        type: Boolean,
        default: false
    },
    customerService: {
        type: Boolean,
        default: false
    },
    user:{
        type: mongoose.schema.objectid,
        ref: 'User',
        required: true
    }
    
    },
    {
        toJSON: {virtuals: true},
    toObject: { virtuals: true}
    }
);
// Create BusCompanie slug from the name

BusCompanieSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true});
    next();
});

// Geocodes & create location field
BusCompanieSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formatedAdress: loc[0].formatedAdress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countrycode
    };

    // Do not save address in DB
    this.address = undefined;
    next();
});

// Cascade delete trips when a buscompanie is deleted
BusCompanieSchema.pre('remove', async function(next) {
    console.log(`Trips bein removed from busCompanie ${this._id}`);
    await this.model('Trip').deleteMany({buscompanie: this._id});
    next();
});

// Reverse populate with vituals
BusCompanieSchema.virtual('trips', {
    ref: 'Trip',
    locationField: '_id',
    foreignField: 'busCompanie',
    justOne: false
});

module.exports = mongoose.model('BusCompanie', BusCompanie);

