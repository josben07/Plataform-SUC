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

            const { data, error } =
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

            res.json(data);

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

            const { data: assignedMentor } =
                await supabase
                    .from("student_mentors")
                    .select("mentor_id")
                    .eq("student_id", user_id)
                    .eq("course_id", course_id)
                    .eq("status", "active")
                    .maybeSingle();

            if (
                normalizedSubmissionType === "final_project" &&
                !assignedMentor
            ) {

                return res.status(400).json({
                    error:
                        "Primero debes elegir un mentor para enviar tu proyecto final."
                });

            }

            const assignedMentorId =
                assignedMentor
                    ? assignedMentor.mentor_id
                    : null;

            const { data, error } =
                await supabase
                    .from("project_submissions")
                    .insert([{

                        user_id,
                        course_id,
                        lesson_id,
                        mentor_id:
                            assignedMentorId,

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

                const { error: taskMentorError } =
                    await supabase
                        .from("project_submissions")
                        .update({
                            mentor_id:
                                assignedMentorId
                        })
                        .eq("user_id", user_id)
                        .eq("course_id", course_id)
                        .eq("submission_type", "task");

                if (taskMentorError) {

                    return res.status(400).json(taskMentorError);

                }

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
