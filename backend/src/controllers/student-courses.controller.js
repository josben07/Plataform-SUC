const supabase =
    require("../config/supabase");

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

module.exports = {

    getStudentCourses,
    buyCourse

};