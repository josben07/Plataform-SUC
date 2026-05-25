const supabase =
require("../config/supabase");

/* ========================= */
/* GET COURSES */
/* ========================= */

const getCourses =
async (req,res) => {

    try{

        const {

            data,
            error

        } = await supabase

        .from("courses")

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
/* CREATE COURSE */
/* ========================= */

const createCourse =
async (req,res) => {

    try{

        const {

            title,
            description,
            category,
            level,
            duration,
            price,
            thumbnail,
            is_locked

        } = req.body;

        const {

            data,
            error

        } = await supabase

        .from("courses")

        .insert([{

            title,
            description,
            category,
            level,
            duration,
            price,
            thumbnail,
            is_locked

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
/* UPDATE COURSE */
/* ========================= */

const updateCourse =
async (req,res) => {

    try{

        const { id } =
        req.params;

        const {

            title,
            description,
            category,
            level,
            duration,
            price,
            thumbnail,
            is_locked

        } = req.body;

        const {

            data,
            error

        } = await supabase

        .from("courses")

        .update({

            title,
            description,
            category,
            level,
            duration,
            price,
            thumbnail,
            is_locked

        })

        .eq("id", id)

        .select();

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
/* DELETE COURSE */
/* ========================= */

const deleteCourse =
async (req,res) => {

    try{

        const { id } =
        req.params;

        const { error } =
        await supabase

        .from("courses")

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
            "Curso eliminado"

        });

    }catch(error){

        res.status(500).json({

            error:
            "Error interno"

        });

    }

};

/* EXPORTS */

module.exports = {

    getCourses,
    createCourse,
    updateCourse,
    deleteCourse

};