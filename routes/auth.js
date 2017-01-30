/**
 * Created by Samuel on 1/25/2017.
 */

const express = require('express');
const router = express.Router();
const data = require('../data');

const auth = require('../auth')

/* GET users listing. */
router.get('/register', auth.hasValidJWT, function (req, res, next) {


    res.send('respond with a resource');

});


router.post("/registerLocal", auth.registerLocalUser);


router.post("/loginLocal", auth.logInLocalUser);


module.exports = router;

