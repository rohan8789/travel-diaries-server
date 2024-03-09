const express = require('express');
const {check} = require('express-validator');

const fileUpload = require("../middleware/file-upoad");
const validateAuth = require('../middleware/auth-validate');

const router = express.Router();

const {getPlaceByPlaceId, getPlacesByUserID, createPlace, updatePlace, deletePlace} = require('../controllers/places-controller');


router.get('/:placeId', getPlaceByPlaceId);
router.get('/user/:userId', getPlacesByUserID);

router.use(validateAuth);

router.post('/', fileUpload.single('image') ,[
    check('title').not().isEmpty(),
    check('description').isLength({min:5}),
    check('address').not().isEmpty()
], createPlace);

router.patch('/:placeId',[
    check('title').not().isEmpty(),
    check('description').isLength({min:5})
], updatePlace);
router.delete('/:placeId', deletePlace);

module.exports = router;