const express = require('express');

const {
    getBusCompanies, 
    getBusCompanie,
     createBusCompanie, 
     updateBusCompanie, 
     deleteBusCompanie,
     getBusCompaniesInRadius,
     busCompaniePhotoUpload
    } = require('../controllers/busCompanies');
    //const BusCompanie = require('../models/BusCompanie');

    // Include other resources routers
    //const tripRouter = require('./trips');
    //const reviewRouter = require('./reviews');

    
const router = express.Router();

//const advancedResults = require('../middleware/advancedResults');
//const { protect, authorize} = require('../middleware/auth');

// Re-reoute into other resource routers
//router.use('/:busCompanieid/trips', tripRouter);
//router.use('/:busCompaniesid/reviews', reviewRouter);

//router.route('/redius:/zipcode/:distance').get(getBusCompaniesInRadius);

//router.route('/:id/photo')
//.put(protect, authorize(companyPublisher, admin), busCompaniePhotoUpload);
router.route('/')

//.get(advancedResults(BusCompanie, 'trips'), getBusCompanies);
//.post(protect, authorize('companyPublisher', 'admin'), createBusCompanie);


router.route('/:id')

.get(getBusCompanie)
//.put(protect, authorize('companyPublisher', 'admin'), updateBusCompanie);
//.delete(protect, authorize('companyPublisher', 'admin'), deleteBusCompanie);


module.exports = router;


