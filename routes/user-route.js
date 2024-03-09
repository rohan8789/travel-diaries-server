const express = require('express');
const {check} = require('express-validator');
const router = express.Router();
const fileUpload = require('../middleware/file-upoad');

const { registerUser, loginUser, getAllUserDetails } = require('../controllers/users-controller');



 
router.get('/', getAllUserDetails);
router.post('/signup', fileUpload.single('image'),  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),  //Test@Test.com =>test@test.com 
    check('password').isLength({min:6}),
    check('repassword').isLength({min:6})
], registerUser);
router.post('/login', loginUser);


module.exports = router;