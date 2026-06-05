const supabase =
    require("../config/supabase");

const {
    syncStudentCourseProgress
} = require("../utils/course-progress");

const getStudentStats =
    async (req, res) => {

        try {

            const {

                userId

            } = req.params;

            /* COURSES */

            const {

                data: courses

            } =
                await supabase
                    .from("courses")
                    .select("*");

            const {
                data: activeCourse
            } =
                await supabase
                    .from("student_courses")
                    .select("*")
                    .eq("student_id", userId)
                    .eq("status", "Activo")
                    .limit(1)
                    .maybeSingle();

            const progressData =
                activeCourse
                    ? await syncStudentCourseProgress(
                        supabase,
                        userId,
                        activeCourse.course_id
                    )
                    : { progress: 0 };

            const available =
                courses.filter(

                    course =>
                        !course.is_locked

                ).length;

            const locked =
                courses.filter(

                    course =>
                        course.is_locked

                ).length;

            res.json({

                availableCourses:
                    available,

                lockedCourses:
                    locked,

                progress:
                    progressData.progress

            });

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

module.exports = {

    getStudentStats

};
