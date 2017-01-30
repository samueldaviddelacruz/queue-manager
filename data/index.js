((data) => {

    var database = require("./database");


    data.getUser = async(username) => {
        console.log(username)
        let db;
        try {
            let user;
            db = await database.getDb();

            user = await db.usuarios.findOne({
                username: username.toUpperCase()
            });

            return user;
        } catch (err) {
            throw err;
        }

    };


    data.addUser = async(user) => {

        let db;
        try {
            db = await database.getDb();
            return await db.usuarios.insert(user);
        } catch (err) {
            console.log(err);
            throw err;
        }

    };


})(module.exports);