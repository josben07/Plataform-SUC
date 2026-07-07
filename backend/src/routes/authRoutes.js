const express =
    require("express");

const router =
    express.Router();

const {

    register,
    login,
    googleLogin,
    verify

} = require(
    "../controllers/authController"
);

/* ROUTES */

router.post(
    "/register",
    register
);

router.post(
    "/login",
    login
);

router.post(
    "/google",
    googleLogin
);

router.get(
    "/verify",
    verify
);

module.exports =
    router;