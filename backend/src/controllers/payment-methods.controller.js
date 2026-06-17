const supabase =
    require("../config/supabase");

const getAll =
    async (req, res) => {

        try {

            const { data, error } =
                await supabase
                    .from("payment_methods")
                    .select("*")
                    .order(
                        "sort_order",
                        { ascending: true }
                    );

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

const create =
    async (req, res) => {

        try {

            const {
                type,
                name,
                fields,
                is_active,
                sort_order
            } = req.body;

            if (!name) {

                return res.status(400).json({

                    error:
                        "name es requerido"

                });

            }

            const { data, error } =
                await supabase
                    .from("payment_methods")
                    .insert({
                        type:
                            type || "otro",
                        name,
                        fields:
                            fields || {},
                        is_active:
                            is_active !== undefined
                                ? is_active
                                : true,
                        sort_order:
                            sort_order || 0
                    })
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

const update =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                type,
                name,
                fields,
                is_active,
                sort_order
            } = req.body;

            const updateData =
                {};

            if (type !== undefined && type !== "") updateData.type = type;
            if (name !== undefined) updateData.name = name;
            if (fields !== undefined) updateData.fields = fields;
            if (is_active !== undefined) updateData.is_active = is_active;
            if (sort_order !== undefined) updateData.sort_order = sort_order;

            const { data, error } =
                await supabase
                    .from("payment_methods")
                    .update(updateData)
                    .eq("id", id)
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

const remove =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { error } =
                await supabase
                    .from("payment_methods")
                    .delete()
                    .eq("id", id);

            if (error) {

                return res.status(400).json(error);

            }

            res.json({

                message:
                    "Método de pago eliminado"

            });

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

module.exports = {

    getAll,
    create,
    update,
    remove

};
