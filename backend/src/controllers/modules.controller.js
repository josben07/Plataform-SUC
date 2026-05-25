const supabase =
require("../config/supabase");

/* ========================= */
/* GET MODULES */
/* ========================= */

const getModules =
async (req,res) => {

    try{

        const { courseId } =
        req.params;

        const {

            data,
            error

        } = await supabase

                .from("modules")
                .select("*")
                .eq("course_id", courseId)
                .order("position", { ascending: true })

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
/* CREATE MODULE */
/* ========================= */

const createModule =
    async (req, res) => {

        try {

            const {

                course_id,
                title

            } = req.body;

            /* GET LAST POSITION */

            const { data: modules } =
                await supabase
                    .from("modules")
                    .select("position")
                    .eq("course_id", course_id)
                    .order("position", {

                        ascending: false

                    })
                    .limit(1);

            let nextPosition = 1;

            if (

                modules &&
                modules.length > 0

            ) {

                nextPosition =
                    modules[0].position + 1;

            }

            /* CREATE MODULE */

            const { data, error } =
                await supabase
                    .from("modules")
                    .insert([{

                        course_id,
                        title,

                        position:
                            nextPosition

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
/* UPDATE MODULE */
/* ========================= */

const updateModule =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {

                title

            } = req.body;

            const { data, error } =
                await supabase
                    .from("modules")
                    .update({

                        title

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
/* DELETE MODULE */
/* ========================= */

const deleteModule =
async (req,res) => {

    try{

        const { id } =
        req.params;

        const { error } =
        await supabase

        .from("modules")

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
            "Módulo eliminado"

        });

    }catch(error){

        res.status(500).json({

            error:
            "Error interno"

        });

    }

};

module.exports = {

    getModules,
    createModule,
    updateModule,
    deleteModule

};