const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path: './config/config.env'});
// connect to database
connectDB();

// Route files
const busCompanies = require('./routes/busCompanies');
const trips = require('./routes/trips');
//const auth = require('./routes/auth');
//const users = require('./routes/users');
//const reviews = require('./routes/reviews');



const app = express();

// Bodyparser
app.use(express.json());

// Cookie parser
app.use(cookieParser);

//Dev login middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//File uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent xss attacks
app.use(xss());

//Rate limiting

const limiter = rateLimit({
    windows: 10 * 60 * 1000, //10 mins
    max:100
});
app.use(limiter);


//Prevent http param pollution
app.use(hpp());

// Enable cors
app.use(cors());

// Set static folder
//app.use(express.static(path.join(__dirname, 'public')));




//mount routers

app.use('/api/v2/busCompanies', busCompanies);
//app.use('/api/v2/trips/', trips);
//app.use('/api/2/auth', auth);
//app.use('/api/v2/users', users);
//app.use('/api/v2/reviews', reviews);
//app.use('/api/v2/locations', locations);
//app.use('/api/v2/destinations', destinations)

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port
${PORT}`.yellow.bold));

//Handle unhandled
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    //Close server & exit process
    server.close(() => process.exit(1));
});