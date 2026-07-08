const express =
require("express");

const router =
express.Router();

const {

    getUsers,
    updateUser,
    deleteUser,
    updatePassword

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

router.put(
    "/:id/password",
    updatePassword
);

router.delete(
    "/:id",
    deleteUser
);

module.exports =
router;
