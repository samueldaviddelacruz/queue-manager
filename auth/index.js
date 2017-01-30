//'auth/index.js'
(function (auth) {
    const data = require('../data');
    const hasher = require('./hasher');
    const config = require('../config');
    const jwt = require('jsonwebtoken');

    async function isLocalUserValid(username, password) {
        let user;

        try {
            user = await data.getUser(username);
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

    const generateJWT = (username) => {

        let token = jwt.sign({username: username}, config.JWT_KEY);
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
            email: req.body.email,
            username: req.body.username.toUpperCase(),
            passwordHash: hasher.computeHash(req.body.password, salt),
            salt: salt
        };
    };


    auth.logInLocalUser = async(req, res) => {
        console.log(req.body);
        let username = req.body.username.toUpperCase();
        let password = req.body.password;

        if (await isLocalUserValid(username, password)) {
            //get JWT here and return it to the user with the response
            //let token = GetJWT();
            //console.log("wtf");
            let response = getResponseWithToken({username});

            return res.status(200).send(response);

        }
        return res.status(401).send("invalid credentials");

    };

    auth.registerLocalUser = async(req, res) => {

        var newUser = getNewUserData(req);
        let user;
        let message;
        try {
            user = await data.getUser(newUser.username);
            if (user) {
                message = `${user.username} already in use`;
                res.status(401).send(message);

            } else {

                await data.addUser(newUser);

                let response = getResponseWithToken(newUser);
                res.status(200).send(response);

            }
        } catch (err) {
            console.log(err);
            message = "Could Not save User to Database";
            res.status(401).res.send(message);

        }
    };

    const getResponseWithToken = (user = {email: "", username: ""}) => {
        let token = generateJWT(user.username);

        return {
            email: user.email,
            username: user.username,
            token: token
        };

    }


})(module.exports);