const express =
    require("express");

const multer =
    require("multer");

const {
    uploadFile
} = require(
    "../controllers/uploads.controller"
);

const router =
    express.Router();

const upload =
    multer({
        storage:
            multer.memoryStorage()
    });

router.post(
    "/:bucket",
    upload.single("file"),
    uploadFile
);

module.exports =
    router;
