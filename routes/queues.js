/**
 * Created by Samuel on 1/31/2017.
 */
var express = require('express');
var router = express.Router();


router.get('/all', function (req, res, next) {

    let queues = [
        {id_business: 1, queue: [1, 2, 3, 4, 5]},
        {id_business: 2, queue: [1, 2, 3, 4, 5]}
    ];


    res.send(queues);

});

module.exports = router;
