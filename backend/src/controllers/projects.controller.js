const supabase =
    require("../config/supabase");

const getCourseMentorForStudent =
    async (userId, courseId) => {

        if (!userId || !courseId) {

            return null;

        }

        const { data: session } =
            await supabase
                .from("mentor_sessions")
                .select("mentor_id")
                .eq("student_id", userId)
                .eq("course_id", courseId)
                .in("status", [
                    "reserved",
                    "confirmed",
                    "completed"
                ])
                .order("created_at", {
                    ascending:
                        false
                })
                .limit(1)
                .maybeSingle();

        if (session && session.mentor_id) {

            return session.mentor_id;

        }

        const { data: assignedMentor } =
            await supabase
                .from("student_mentors")
                .select("mentor_id")
                .eq("student_id", userId)
                .eq("course_id", courseId)
                .eq("status", "active")
                .limit(1)
                .maybeSingle();

        return assignedMentor
            ? assignedMentor.mentor_id
            : null;

    };

const enrichProjects =
    async (projects) => {

        const userIds =
            [
                ...new Set(
                    projects
                        .flatMap(project => [
                            project.user_id,
                            project.mentor_id
                        ])
                        .filter(Boolean)
                )
            ];

        const courseIds =
            [
                ...new Set(
                    projects
                        .map(project => project.course_id)
                        .filter(Boolean)
                )
            ];

        const lessonIds =
            [
                ...new Set(
                    projects
                        .map(project => project.lesson_id)
                        .filter(Boolean)
                )
            ];

        let userMap =
            {};

        let courseMap =
            {};

        let lessonMap =
            {};

        if (userIds.length > 0) {

            const { data: users } =
                await supabase
                    .from("users")
                    .select("id, full_name")
                    .in("id", userIds);

            if (users) {

                userMap =
                    Object.fromEntries(
                        users.map(user => [
                            user.id,
                            user.full_name
                        ])
                    );

            }

        }

        if (courseIds.length > 0) {

            const { data: courses } =
                await supabase
                    .from("courses")
                    .select("id, title")
                    .in("id", courseIds);

            if (courses) {

                courseMap =
                    Object.fromEntries(
                        courses.map(course => [
                            course.id,
                            course.title
                        ])
                    );

            }

        }

        if (lessonIds.length > 0) {

            const { data: lessons } =
                await supabase
                    .from("lessons")
                    .select("id, title, task_title")
                    .in("id", lessonIds);

            if (lessons) {

                lessonMap =
                    Object.fromEntries(
                        lessons.map(lesson => [
                            lesson.id,
                            lesson
                        ])
                    );

            }

        }

        return projects.map(project => {

            const lesson =
                lessonMap[project.lesson_id] || {};

            return {

                ...project,

                user_name:
                    userMap[project.user_id] ||
                    "Alumno desconocido",

                course_title:
                    courseMap[project.course_id] ||
                    "Curso desconocido",

                lesson_title:
                    lesson.title ||
                    "",

                task_title:
                    lesson.task_title ||
                    "",

                mentor_name:
                    project.mentor_id
                        ? userMap[project.mentor_id] ||
                          "Mentor desconocido"
                        : "Sin mentor asignado"

            };

        });

    };

/* ========================= */
/* GET PROJECTS */
/* ========================= */

const getProjects =
    async (req, res) => {

        try {

            const { data, error } =
                await supabase
                    .from("project_submissions")
                    .select("*")
                    .order("created_at", {

                        ascending: false

                    });

            if (error) {

                return res.status(400).json(error);

            }

            const enriched =
                await enrichProjects(
                    data || []
                );

            res.json(enriched);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* ========================= */
/* GET PROJECTS BY MENTOR */
/* ========================= */

const getProjectsByMentor =
    async (req, res) => {

        try {

            const { mentorId } =
                req.params;

            const { data: projects, error } =
                await supabase
                    .from("project_submissions")
                    .select("*")
                    .eq("mentor_id", mentorId)
                    .order("created_at", {

                        ascending: false

                    });

            if (error) {

                return res.status(400).json(error);

            }

            const enriched =
                await enrichProjects(
                    projects || []
                );

            res.json(enriched);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* ========================= */
/* CREATE PROJECT */
/* ========================= */

const createProject =
    async (req, res) => {

        try {

            const {

                user_id,
                course_id,
                lesson_id,
                title,
                description,
                project_url,
                submission_type,
                status

            } = req.body;

            const allowedSubmissionTypes =
                [
                    "task",
                    "final_project"
                ];

            const normalizedSubmissionType =
                allowedSubmissionTypes.includes(
                    submission_type
                )
                    ? submission_type
                    : "task";

            const normalizedStatus =
                status || "pending";

            if (normalizedSubmissionType === "final_project") {

                const { data: studentCourse } =
                    await supabase
                        .from("student_courses")
                        .select("progress")
                        .eq("student_id", user_id)
                        .eq("course_id", course_id)
                        .maybeSingle();

                if (
                    !studentCourse ||
                    Number(studentCourse.progress || 0) < 100
                ) {

                    return res.status(400).json({
                        error:
                            "Completa todas las clases antes de enviar el proyecto final."
                    });

                }

            }

            const mentorId =
                normalizedSubmissionType === "final_project"
                    ? await getCourseMentorForStudent(
                        user_id,
                        course_id
                    )
                    : null;

            const { data, error } =
                await supabase
                    .from("project_submissions")
                    .insert([{

                        user_id,
                        course_id,
                        lesson_id,
                        mentor_id:
                            mentorId,

                        title,
                        description,
                        project_url,
                        status:
                            normalizedStatus,
                        submission_type:
                            normalizedSubmissionType

                    }])
                    .select();

            if (error) {

                return res.status(400).json(error);

            }

            if (normalizedSubmissionType === "final_project") {

                const { error: courseError } =
                    await supabase
                        .from("student_courses")
                        .update({
                            final_project_submitted:
                                true
                        })
                        .eq("student_id", user_id)
                        .eq("course_id", course_id);

                if (courseError) {

                    return res.status(400).json(courseError);

                }

            }

            res.json(data);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* ========================= */
/* UPDATE STATUS */
/* ========================= */

const updateProjectStatus =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {

                status,
                feedback,
                title,
                description,
                project_url,
                course_id

            } = req.body;

            const updateData =
                {};

            if (status !== undefined) {
                updateData.status =
                    status;
            }

            if (feedback !== undefined) {
                updateData.feedback =
                    feedback;
            }

            if (title !== undefined) {
                updateData.title =
                    title;
            }

            if (description !== undefined) {
                updateData.description =
                    description;
            }

            if (project_url !== undefined) {
                updateData.project_url =
                    project_url;
            }

            if (course_id !== undefined) {
                updateData.course_id =
                    course_id;
            }

            const { data, error } =
                await supabase
                    .from("project_submissions")
                    .update(updateData)
                    .eq("id", id)
                    .select()
                    .single();

            if (error) {

                return res.status(400).json(error);

            }

            if (data.submission_type === "final_project") {

                const courseUpdate =
                    {};

                if (status === "approved") {

                    courseUpdate.final_project_approved =
                        true;

                }

                if (
                    status === "pending" ||
                    status === "rejected"
                ) {

                    courseUpdate.final_project_approved =
                        false;

                }

                if (Object.keys(courseUpdate).length > 0) {

                    const { error: courseError } =
                        await supabase
                            .from("student_courses")
                            .update(courseUpdate)
                            .eq("student_id", data.user_id)
                            .eq("course_id", data.course_id);

                    if (courseError) {

                        return res.status(400).json(courseError);

                    }

                }

            }

            res.json(data);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* ========================= */
/* DELETE PROJECT */
/* ========================= */

const deleteProject =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { error } =
                await supabase
                    .from("project_submissions")
                    .delete()
                    .eq("id", id);

            if (error) {

                return res.status(400).json(error);

            }

            res.json({
                message:
                    "Proyecto eliminado"
            });

        } catch (err) {

            res.status(500).json({
                error:
                    err.message
            });

        }

    };

module.exports = {

    getProjects,
    getProjectsByMentor,
    createProject,
    updateProjectStatus,
    deleteProject

};
