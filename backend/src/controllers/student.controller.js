const supabase =
    require("../config/supabase");

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

            /* PROGRESS */

            const {

                data: progress

            } =
                await supabase
                    .from("lesson_progress")
                    .select("*")
                    .eq(
                        "user_id",
                        userId
                    )
                    .eq(
                        "completed",
                        true
                    );

            /* TOTAL LESSONS */

            const {

                data: lessons

            } =
                await supabase
                    .from("lessons")
                    .select("*");

            const totalLessons =
                lessons.length;

            const completedLessons =
                progress.length;

            const progressPercentage =
                totalLessons === 0

                    ? 0

                    : Math.round(

                        (
                            completedLessons /
                            totalLessons
                        ) * 100

                    );

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
                    progressPercentage

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