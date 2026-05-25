const supabase =
    require("../config/supabase");

/* GET */

const getPayments =
    async (req, res) => {

        try {

            const { data, error } =
                await supabase
                    .from("payments")
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

/* CREATE */

const createPayment =
    async (req, res) => {

        try {

            const {

                user_name,
                course_name,
                amount,
                payment_method

            } = req.body;

            const { data, error } =
                await supabase
                    .from("payments")
                    .insert([{

                        user_name,
                        course_name,
                        amount,
                        payment_method

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

/* UPDATE */

const updatePayment =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                status
            } = req.body;

            /* PAYMENT */

            const {
                data: payment
            } =
                await supabase
                    .from("payments")
                    .select("*")
                    .eq("id", id)
                    .single();

            const {
                data,
                error
            } =
                await supabase
                    .from("payments")
                    .update({
                        status
                    })
                    .eq("id", id)
                    .select()
                    .single();

            if (error) {

                return res
                    .status(400)
                    .json(error);

            }

            /* AUTO UNLOCK */

            if (status === "aprobado") {

                await supabase
                    .from("student_courses")
                    .update({
                        unlocked:
                            true
                    })
                    .eq(
                        "student_id",
                        payment.student_id
                    )
                    .eq(
                        "course_id",
                        payment.course_id
                    );

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

    getPayments,
    createPayment,
    updatePayment

};