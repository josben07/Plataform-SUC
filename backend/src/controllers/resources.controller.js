const supabase =
    require("../config/supabase");

/* ========================= */
/* GET RESOURCES */
/* ========================= */

const getResources =
    async (req, res) => {

        try {

            const { lessonId } =
                req.params;

            const { data, error } =
                await supabase
                    .from("resources")
                    .select("*")
                    .eq("lesson_id", lessonId);

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
/* CREATE RESOURCE */
/* ========================= */

const createResource =
    async (req, res) => {

        try {

            const {

                lesson_id,
                title,
                file_url,
                file_type

            } = req.body;

            const { data, error } =
                await supabase
                    .from("resources")
                    .insert([{

                        lesson_id,
                        title,
                        file_url,
                        file_type

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
/* DELETE RESOURCE */
/* ========================= */

const deleteResource =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { error } =
                await supabase
                    .from("resources")
                    .delete()
                    .eq("id", id);

            if (error) {

                return res.status(400).json(error);

            }

            res.json({

                message:
                    "Resource eliminado"

            });

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

module.exports = {

    getResources,
    createResource,
    deleteResource

};