const express = require("express");
const router = express.Router();
const {
    getStudentCertificates,
    generateCertificate
} = require("../controllers/certificates.controller");

router.get("/:studentId", getStudentCertificates);
router.post("/generate", generateCertificate);

module.exports = router;
