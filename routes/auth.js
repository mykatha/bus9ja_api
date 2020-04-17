const exress = require('express');
const {
    regisetr,
    loging,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,

} = require('../controllers/auth');

const router = express.Router();

const { protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatpasspassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword );

module.exports = router;