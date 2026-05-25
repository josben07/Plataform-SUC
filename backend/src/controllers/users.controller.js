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

module.exports = {

    getUsers,
    updateUser

};

