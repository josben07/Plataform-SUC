const express =
    require("express");

const router =
    express.Router();

const {

    getPayments,
    createPayment,
    updatePayment

} = require(
    "../controllers/payments.controller"
);

/* GET */

router.get(
    "/",
    getPayments
);

/* CREATE */

router.post(
    "/",
    createPayment
);

/* UPDATE */

router.put(
    "/:id",
    updatePayment
);

module.exports =
    router;