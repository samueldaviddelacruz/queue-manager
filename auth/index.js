//'auth/index.js'
(function (auth) {
    const data = require('../data');
    const hasher = require('./hasher');
    const config = require('../config');
    const jwt = require('jsonwebtoken');

    async function isLocalUserValid(email, password) {
        let user;

        try {
            user = await data.getUser(email);
            if (!user) {
                return false;
            }

            console.log(user);
            var testHash = hasher.computeHash(password, user.salt);

            if (testHash === user.passwordHash) {
                console.log(testHash);
                return true;

            }
            return false;
        } catch (err) {
            throw err;
        }
    }

    const generateJWT = (email) => {

        let token = jwt.sign({name: email}, config.JWT_KEY);
        return token;
    };

    const isTokenValid = (token) => {
        try {
            let decoded = jwt.verify(token, config.JWT_KEY);
            if (!decoded) {
                return false;
            }
            return true;
        } catch (err) {
            console.log(err);
            throw err;
        }
        return false;
    };

    auth.hasValidJWT = (req, res, next) => {
        console.log(req.headers);

        if (!req.headers.authorization) {
            return res.status(401).send("Missing Authorization header");
        }
        let token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).send("Missing Authorization Token");
        }

        try {

            if (!isTokenValid(token)) {
                return res.status(401).send("Invalid Token");
            }

            next();
        } catch (err) {
            console.log(err);
            return res.status(401).send(err);
        }
    };

    const getNewUserData = (req) => {
        var salt = hasher.createSalt();
        return {
            //name: req.body.name,
            email: req.body.email.toUpperCase(),
            name: req.body.name,
            passwordHash: hasher.computeHash(req.body.password, salt),
            salt: salt
        };
    };


    auth.logInLocalUser = async(req, res) => {
        console.log(req.body);

        let email = req.body.email.toUpperCase();
        let password = req.body.password;

        if (await isLocalUserValid(email, password)) {
            //get JWT here and return it to the user with the response
            //let token = GetJWT();
            //console.log("wtf");
            let response = getResponseWithToken({email});

            return res.status(200).send(response);

        }
        return res.status(401).send("invalid credentials");

    };

    auth.registerLocalUser = async(req, res) => {

        var newUser = getNewUserData(req);
        let user;
        let message;
        try {

                await data.addUser(newUser);

                let response = getResponseWithToken(newUser);
                res.status(200).send(response);


        } catch (err) {

            // debugger;
            //console.log(err);


            message = parseErrorMessage(err);
            return res.status(401).send(message);
        }

    };

    const parseErrorMessage = (err) => {
        console.log(err.message);
        let returnMessage = "Could Not save User to Database";
        let errorMessage = err.message;
        if (errorMessage.indexOf("E11000") != -1) {

            returnMessage = parseUniqueConstraintError(errorMessage);

            console.log(`duplicate key ${returnMessage}`);
            return returnMessage;
        }
        return returnMessage;

    };

    const parseUniqueConstraintError = (errorMessage) => {

        let startIndxEmail = errorMessage.indexOf(`"`) + 1;
        let endIndxEmail = errorMessage.lastIndexOf(`"`);

        let email = errorMessage.substring(startIndxEmail, endIndxEmail);

        //+errorMessage.substring(startIndx,endIndx);
        let returnMessage = `${email} already exists`;

        return returnMessage;


    };


    const getResponseWithToken = (user = {email: "", name: ""}) => {
        let token = generateJWT(user.email);

        return {
            email: user.email,
            name: user.name,
            token: token
        };

    }


})(module.exports);