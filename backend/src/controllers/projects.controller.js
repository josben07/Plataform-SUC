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
                project_url

            } = req.body;

            const { data, error } =
                await supabase
                    .from("project_submissions")
                    .insert([{

                        user_id,
                        course_id,
                        lesson_id,

                        title,
                        description,
                        project_url

                    }])
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
    createProject,
    updateProjectStatus,
    deleteProject

};