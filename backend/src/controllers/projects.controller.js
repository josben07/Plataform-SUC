const supabase =
    require("../config/supabase");

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

            res.json(data);

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

            const userIds = [...new Set(projects.map(p => p.user_id).filter(Boolean))];
            const courseIds = [...new Set(projects.map(p => p.course_id).filter(Boolean))];

            let userMap = {};
            let courseMap = {};

            if (userIds.length > 0) {

                const { data: users } = await supabase
                    .from("users")
                    .select("id, full_name")
                    .in("id", userIds);
                if (users) userMap = Object.fromEntries(users.map(u => [u.id, u.full_name]));

            }

            if (courseIds.length > 0) {

                const { data: courses } = await supabase
                    .from("courses")
                    .select("id, title")
                    .in("id", courseIds);
                if (courses) courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));

            }

            const enriched = projects.map(p => ({
                ...p,
                user_name: userMap[p.user_id] || "Desconocido",
                course_title: courseMap[p.course_id] || "Curso desconocido"
            }));

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

            const { data, error } =
                await supabase
                    .from("project_submissions")
                    .insert([{

                        user_id,
                        course_id,
                        lesson_id,
                        mentor_id:
                            null,

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
                feedback

            } = req.body;

            const { data, error } =
                await supabase
                    .from("project_submissions")
                    .update({

                        status,
                        feedback

                    })
                    .eq("id", id)
                    .select()
                    .single();

            if (error) {

                return res.status(400).json(error);

            }

            if (
                data.submission_type === "final_project" &&
                status === "approved"
            ) {

                const { error: courseError } =
                    await supabase
                        .from("student_courses")
                        .update({
                            final_project_approved:
                                true
                        })
                        .eq("student_id", data.user_id)
                        .eq("course_id", data.course_id);

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
