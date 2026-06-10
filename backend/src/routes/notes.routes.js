const express = require("express");
const router = express.Router();
const {
    getAllStudentNotes,
    getCourseNotes,
    getLessonNote,
    upsertLessonNote,
    deleteLessonNote
} = require("../controllers/notes.controller");

router.get("/:studentId", getAllStudentNotes);
router.get("/:studentId/:courseId", getCourseNotes);
router.get("/:studentId/:courseId/:lessonId", getLessonNote);
router.put("/:studentId/:courseId/:lessonId", upsertLessonNote);
router.delete("/:studentId/:courseId/:lessonId", deleteLessonNote);

module.exports = router;
