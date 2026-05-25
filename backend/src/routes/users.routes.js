const express =
require("express");

const router =
express.Router();

const {

    getUsers,
    updateUser

} = require(
    "../controllers/users.controller"
);

/* GET USERS */

router.get(
    "/",
    getUsers
);

router.put(
    "/:id",
    updateUser
);

module.exports =
router;