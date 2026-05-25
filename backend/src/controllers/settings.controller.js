const supabase =
    require("../config/supabase");

/* GET */

const getSettings =
    async (req, res) => {

        try {

            const { data, error } =
                await supabase
                    .from("settings")
                    .select("*")
                    .limit(1)
                    .single();

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

/* UPDATE */

const updateSettings =
    async (req, res) => {

        try {

            const { data: currentSettings } =
                await supabase
                    .from("settings")
                    .select("id")
                    .limit(1)
                    .single();

            const { data, error } =
                await supabase
                    .from("settings")
                    .update(req.body)
                    .eq("id", currentSettings.id)
                    .select()
                    .single();

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

    getSettings,
    updateSettings

};