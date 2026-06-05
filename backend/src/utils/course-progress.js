const calculateCourseProgress =
    async (supabase, userId, courseId) => {

        const { data: modules, error: modulesError } =
            await supabase
                .from("modules")
                .select("id")
                .eq("course_id", courseId);

        if (modulesError) {

            throw modulesError;

        }

        const moduleIds =
            (modules || []).map(module => module.id);

        if (moduleIds.length === 0) {

            return {
                progress: 0,
                completedLessons: 0,
                totalLessons: 0
            };

        }

        const { data: lessons, error: lessonsError } =
            await supabase
                .from("lessons")
                .select("id")
                .in("module_id", moduleIds);

        if (lessonsError) {

            throw lessonsError;

        }

        const lessonIds =
            new Set(
                (lessons || []).map(lesson => lesson.id)
            );

        const totalLessons =
            lessonIds.size;

        if (totalLessons === 0) {

            return {
                progress: 0,
                completedLessons: 0,
                totalLessons: 0
            };

        }

        const { data: progressRows, error: progressError } =
            await supabase
                .from("lesson_progress")
                .select("lesson_id")
                .eq("user_id", userId)
                .eq("course_id", courseId)
                .eq("completed", true);

        if (progressError) {

            throw progressError;

        }

        const completedLessonIds =
            new Set(
                (progressRows || [])
                    .map(row => row.lesson_id)
                    .filter(lessonId => lessonIds.has(lessonId))
            );

        const completedLessons =
            completedLessonIds.size;

        const progress =
            Math.min(
                100,
                Math.round(
                    (completedLessons / totalLessons) * 100
                )
            );

        return {
            progress,
            completedLessons,
            totalLessons
        };

    };

const syncStudentCourseProgress =
    async (supabase, userId, courseId) => {

        const progressData =
            await calculateCourseProgress(
                supabase,
                userId,
                courseId
            );

        const { error } =
            await supabase
                .from("student_courses")
                .update({
                    progress:
                        progressData.progress
                })
                .eq("student_id", userId)
                .eq("course_id", courseId);

        if (error) {

            throw error;

        }

        return progressData;

    };

module.exports = {
    calculateCourseProgress,
    syncStudentCourseProgress
};
