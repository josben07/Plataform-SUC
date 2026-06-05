const supabase =
    require("../config/supabase");

const {
    syncStudentCourseProgress
} = require("../utils/course-progress");

/* GET */

const getStudentCourses =
    async (req, res) => {

        try {

            const {

                studentId

            } =
                req.params;

            const {

                data,
                error

            } =
                await supabase
                    .from("student_courses")
                    .select("*")
                    .eq(
                        "student_id",
                        studentId
                    );

            if (error) {

                return res.status(400)
                    .json(error);

            }

            res.json(data);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* BUY */

const buyCourse =
    async (req, res) => {

        try {

            const {

                student_id,
                student_name,
                course_id,
                course_name

            } =
                req.body;

            /* VERIFY EXISTS */

            const {

                data: existing

            } =
                await supabase
                    .from("student_courses")
                    .select("*")
                    .eq(
                        "student_id",
                        student_id
                    )
                    .eq(
                        "course_id",
                        course_id
                    )
                    .single();

            if (existing) {

                return res.status(400)
                    .json({

                        error:
                            "Curso ya solicitado"

                    });

            }

            /* PAYMENT */

            await supabase
                .from("payments")
                .insert([{

                    student_id,
                    course_id,

                    user_name:
                        student_name,

                    course_name,

                    amount:
                        100,

                    payment_method:
                        "Simulado",

                    status:
                        "pendiente"

                }]);

            /* STUDENT COURSE */

            const {

                data,
                error

            } =
                await supabase
                    .from("student_courses")
                    .insert([{

                        student_id,
                        course_id,

                        course_name,

                        unlocked: false

                    }])
                    .select();

            if (error) {

                return res.status(400)
                    .json(error);

            }

            res.json(data);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* ENROLL COURSE */

const enrollCourse =
    async (req, res) => {

        try {

            const {
                student_id,
                course_id,
                course_name
            } = req.body;

            /* VERIFY ACTIVE COURSE */

            const {
                data: activeCourse
            } =
                await supabase
                    .from("student_courses")
                    .select("*")
                    .eq("student_id", student_id)
                    .eq("status", "Activo")
                    .single();

            if (activeCourse) {

                return res.status(400).json({
                    error:
                        "Ya tienes un curso en progreso. Completa el actual para acceder a otros."
                });

            }

            /* VERIFY EXISTING RELATION */

            const {
                data: existing
            } =
                await supabase
                    .from("student_courses")
                    .select("*")
                    .eq("student_id", student_id)
                    .eq("course_id", course_id)
                    .single();

            if (existing) {

                const { data, error } =
                    await supabase
                        .from("student_courses")
                        .update({
                            status:
                                "Activo",

                            unlocked:
                                true,

                            course_name
                        })
                        .eq("id", existing.id)
                        .select()
                        .single();

                if (error) {

                    return res.status(400).json(error);

                }

                return res.json(data);

            }

            /* CREATE ACTIVE COURSE */

            const { data, error } =
                await supabase
                    .from("student_courses")
                    .insert([{
                        student_id,
                        course_id,
                        course_name,
                        status:
                            "Activo",
                        unlocked:
                            true,
                        progress:
                            0
                    }])
                    .select()
                    .single();

            if (error) {

                return res.status(400).json(error);

            }

            res.json(data);

        } catch (err) {

            res.status(500).json({
                error:
                    err.message
            });

        }

    };

/* COMPLETE COURSE */

const completeCourse =
    async (req, res) => {

        try {

            const {
                student_id,
                course_id
            } = req.body;

            const progressData =
                await syncStudentCourseProgress(
                    supabase,
                    student_id,
                    course_id
                );

            if (progressData.progress < 100) {

                return res.status(400).json({
                    error:
                        "Debes completar todas las clases antes de finalizar el curso."
                });

            }

            const { data, error } =
                await supabase
                    .from("student_courses")
                    .update({
                        status:
                            "Completed",
                        progress:
                            100
                    })
                    .eq("student_id", student_id)
                    .eq("course_id", course_id)
                    .select()
                    .single();

            if (error) {

                return res.status(400).json(error);

            }

            res.json(data);

        } catch (err) {

            res.status(500).json({
                error:
                    err.message
            });

        }

    };

module.exports = {

    getStudentCourses,
    buyCourse,
    enrollCourse,
    completeCourse

};
