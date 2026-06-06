const express =
    require("express");

const router =
    express.Router();

const {

    getProjects,
    getProjectsByMentor,
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

/* GET BY MENTOR */

router.get(
    "/mentor/:mentorId",
    getProjectsByMentor
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
