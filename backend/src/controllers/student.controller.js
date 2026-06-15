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

const getStudentMentors =
    async (req, res) => {

        try {

            const { userId } = req.params;

            const { data: studentCourses } = await supabase
                .from("student_courses")
                .select("course_id")
                .eq("student_id", userId);

            const hasCourses = studentCourses && studentCourses.length > 0;
            const enrolledCourseIds = hasCourses
                ? studentCourses.map(sc => sc.course_id)
                : [];

            const { data: courseMentors } = await supabase
                .from("course_mentors")
                .select("*");

            const courseMentorIds = hasCourses && courseMentors
                ? new Set(
                    courseMentors
                        .filter(cm => enrolledCourseIds.includes(cm.course_id))
                        .map(cm => cm.mentor_id)
                  )
                : new Set();

            const { data: mentors } = await supabase
                .from("users")
                .select("id, full_name, email, mentor_profiles(*)")
                .eq("role", "mentor")
                .eq("status", "active");

            const result = (mentors || []).map(m => ({
                id: m.id,
                full_name: m.full_name,
                email: m.email,
                profile: m.mentor_profiles?.[0] || null,
                available: hasCourses && courseMentorIds.has(m.id)
            }));

            res.json({
                mentors: result,
                has_enrolled_courses: hasCourses
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

module.exports = {

    getStudentStats,
    getStudentMentors

};
