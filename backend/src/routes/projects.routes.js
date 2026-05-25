const express =
    require("express");

const router =
    express.Router();

const {

    getProjects,
    createProject,
    updateProjectStatus,
    deleteProject

} = require(
    "../controllers/projects.controller"
);

/* GET */

router.get(
    "/",
    getProjects
);

/* CREATE */

router.post(
    "/",
    createProject
);

/* UPDATE STATUS */

router.put(
    "/:id",
    updateProjectStatus
);

router.delete(
    "/:id",
    deleteProject
);

module.exports =
    router;