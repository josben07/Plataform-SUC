const express =
    require("express");

const router =
    express.Router();

const {

    createResource,
    getResources,
    deleteResource

} = require(
    "../controllers/resources.controller"
);

/* GET */

router.get(
    "/:lessonId",
    getResources
);

/* CREATE */

router.post(
    "/",
    createResource
);

/* DELETE */

router.delete(
    "/:id",
    deleteResource
);

module.exports =
    router;