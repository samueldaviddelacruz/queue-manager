/**
 * Created by Samuel on 1/31/2017.
 */
var express = require('express');
var router = express.Router();
let businessList = [
    {id_business: 1, business_name: "Barberia chicho", queue: [1, 2, 3, 4, 5]},
    {id_business: 2, business_name: "Salon La Greña", queue: [1, 2, 3, 4, 5]},
    {id_business: 3, business_name: "Barberia la grasa", queue: [1, 2, 3, 4, 5]}
];

router.get('/all', function (req, res, next) {
    let results = [];
    if (Object.keys(req.query).length === 0) {
        return res.send(businessList);
    }

    filterByParam(req).forEach((fo) => {
        results.push(fo);
    });
    res.send(results);

});

const filterByParam = (req) => {
    let results = [];
    for (let pproperty in req.query) {

        let paramval = req.query[pproperty].toUpperCase();

        let filteredList = businessList.filter((business) => {
            //console.log(business[pproperty])
            //console.log(paramval)
            let objvalue = business[pproperty];

            let condition = isString(objvalue) ? objvalue.toUpperCase().indexOf(paramval) != -1 : objvalue == paramval;


            return condition;
        });

        filteredList.forEach((fo) => {
            results.push(fo);
        });
    }
    console.log(results)
    return results;

};


const isString = (value) => {
    return typeof value == "string"
}
module.exports = router;
