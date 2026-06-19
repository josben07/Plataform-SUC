const supabase =
require("../config/supabase");

/* ========================= */
/* GET USERS */
/* ========================= */

const getUsers =
async (req,res) => {

    try{

        const {

            data,
            error

        } = await supabase

        .from("users")

        .select("*")

        .order(
            "created_at",
            {
                ascending: false
            }
        );

        if(error){

            return res.status(500).json({

                error:
                error.message

            });

        }

        res.status(200).json(data);

    }catch(error){

        res.status(500).json({

            error:
            "Error interno"

        });

    }

};

/* ========================= */
/* UPDATE USER */
/* ========================= */

const updateUser =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                full_name,
                role,
                status
            } = req.body;

            const {
                data: existingUser,
                error: existingUserError
            } =
                await supabase
                    .from("users")
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();

            if (existingUserError) {

                return res.status(400).json(existingUserError);

            }

            if (!existingUser) {

                return res.status(404).json({
                    error:
                        "Usuario no encontrado"
                });

            }

            if (existingUser.is_protected === true) {

                return res.status(403).json({
                    error:
                        "Este usuario es un admin protegido y no se puede modificar."
                });

            }

            const { data, error } =
                await supabase
                    .from("users")
                    .update({
                        full_name,
                        role,
                        status
                    })
                    .eq("id", id)
                    .select();

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
/* DELETE USER (student or mentor) */
/* ========================= */

const deleteUser =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                data: existingUser,
                error: existingUserError
            } =
                await supabase
                    .from("users")
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();

            if (existingUserError) {

                return res.status(400).json(existingUserError);

            }

            if (!existingUser) {

                return res.status(404).json({
                    error:
                        "Usuario no encontrado"
                });

            }

            if (existingUser.is_protected === true) {

                return res.status(403).json({
                    error:
                        "Este usuario es un admin protegido y no se puede eliminar."
                });

            }

            if (existingUser.role !== "student" && existingUser.role !== "mentor") {

                return res.status(403).json({
                    error:
                        "Solo se pueden eliminar alumnos o mentores desde este panel."
                });

            }

            const roleLabel =
                existingUser.role === "mentor" ? "Mentor" : "Alumno";

            const { data: userComments } =
                await supabase
                    .from("lesson_comments")
                    .select("id")
                    .eq("user_id", id);

            const userCommentIds =
                (userComments || [])
                    .map(comment => comment.id)
                    .filter(Boolean);

            if (userCommentIds.length > 0) {

                const { error: commentReactionError } =
                    await supabase
                        .from("comment_reactions")
                        .delete()
                        .in("comment_id", userCommentIds);

                if (commentReactionError) {

                    return res.status(400).json({
                        error:
                            `No se pudieron limpiar reacciones de comentarios: ${commentReactionError.message || commentReactionError.details || "Error desconocido"}`
                    });

                }

            }

            const baseDeleteSteps =
                [
                    {
                        table:
                            "comment_reactions",
                        column:
                            "user_id"
                    },
                    {
                        table:
                            "lesson_comments",
                        column:
                            "user_id"
                    },
                    {
                        table:
                            "notes",
                        column:
                            "student_id"
                    },
                    {
                        table:
                            "lesson_progress",
                        column:
                            "user_id"
                    },
                    {
                        table:
                            "project_submissions",
                        column:
                            "user_id"
                    },
                    {
                        table:
                            "payments",
                        column:
                            "student_id"
                    },
                    {
                        table:
                            "student_courses",
                        column:
                            "student_id"
                    },
                    {
                        table:
                            "certificates",
                        column:
                            "student_id"
                    }
                ];

            const mentorDeleteSteps =
                [
                    {
                        table:
                            "mentor_profiles",
                        column:
                            "user_id"
                    },
                    {
                        table:
                            "course_mentors",
                        column:
                            "mentor_id"
                    },
                    {
                        table:
                            "student_mentors",
                        column:
                            "mentor_id"
                    },
                    {
                        table:
                            "mentorship_completions",
                        column:
                            "mentor_id"
                    },
                    {
                        table:
                            "mentor_sessions",
                        column:
                            "mentor_id"
                    }
                ];

            const studentDeleteSteps =
                [
                    {
                        table:
                            "mentorship_completions",
                        column:
                            "student_id"
                    },
                    {
                        table:
                            "student_mentors",
                        column:
                            "student_id"
                    },
                    {
                        table:
                            "mentor_sessions",
                        column:
                            "student_id"
                    }
                ];

            const allSteps =
                existingUser.role === "mentor"
                    ? [...baseDeleteSteps, ...mentorDeleteSteps, ...studentDeleteSteps]
                    : [...baseDeleteSteps, ...studentDeleteSteps];

            const seen = new Set();
            const dedupedSteps = [];
            for (const step of allSteps) {
                const key = `${step.table}:${step.column}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    dedupedSteps.push(step);
                }
            }

            for (const step of dedupedSteps) {

                const { error } =
                    await supabase
                        .from(step.table)
                        .delete()
                        .eq(step.column, id);

                if (error) {

                    return res.status(400).json({
                        error:
                            `No se pudo limpiar ${step.table}: ${error.message || error.details || "Error desconocido"}`
                    });

                }

            }

            const { error: userDeleteError } =
                await supabase
                    .from("users")
                    .delete()
                    .eq("id", id);

            if (userDeleteError) {

                return res.status(400).json(userDeleteError);

            }

            res.json({
                message:
                    `${roleLabel} e historial eliminados correctamente`
            });

        } catch (err) {

            res.status(500).json({
                error:
                    err.message
            });

        }

    };

module.exports = {

    getUsers,
    updateUser,
    deleteUser

};

