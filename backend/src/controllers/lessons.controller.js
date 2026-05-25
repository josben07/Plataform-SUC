const supabase =
require("../config/supabase");

/* ========================= */
/* GET LESSONS */
/* ========================= */

const getLessons =
async (req,res) => {

    try{

        const { moduleId } =
        req.params;

        const {

            data,
            error

        } = await supabase

        .from("lessons")

        .select("*")

        .eq(
            "module_id",
            moduleId
        )

        .order(
            "position",
            {
                ascending: true
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
/* CREATE LESSON */
/* ========================= */

const createLesson =
async (req,res) => {

    try{

        const {

            module_id,
            title,
            video_url,
            duration,
            position,
            is_preview

        } = req.body;

        const {

            data,
            error

        } = await supabase

        .from("lessons")

        .insert([{

            module_id,
            title,
            video_url,
            duration,
            position,
            is_preview

        }])

        .select();

        if(error){

            return res.status(500).json({

                error:
                error.message

            });

        }

        res.status(201).json(data);

    }catch(error){

        res.status(500).json({

            error:
            "Error interno"

        });

    }

};

/* ========================= */
/* UPDATE LESSON */
/* ========================= */

const updateLesson =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {

                title,
                duration,
                video_url,
                is_preview

            } = req.body;

            const { data, error } =
                await supabase
                    .from("lessons")
                    .update({

                        title,
                        duration,
                        video_url,
                        is_preview

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
/* DELETE LESSON */
/* ========================= */

const deleteLesson =
async (req,res) => {

    try{

        const { id } =
        req.params;

        const { error } =
        await supabase

        .from("lessons")

        .delete()

        .eq("id", id);

        if(error){

            return res.status(500).json({

                error:
                error.message

            });

        }

        res.status(200).json({

            message:
            "Clase eliminada"

        });

    }catch(error){

        res.status(500).json({

            error:
            "Error interno"

        });

    }

};

module.exports = {

    getLessons,
    createLesson,
    updateLesson,
    deleteLesson

};