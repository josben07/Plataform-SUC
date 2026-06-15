const supabase =
    require("../config/supabase");

const jwt =
    require("jsonwebtoken");

const PAYMENT_PROVIDERS =
    [
        "manual",
        "culqi"
    ];

const normalizePaymentProvider =
    (provider) => {

        if (!provider) {

            return null;

        }

        return PAYMENT_PROVIDERS.includes(provider)
            ? provider
            : null;

    };

const getCurrentTimestamp =
    () => new Date().toISOString();

const getRequestRole =
    (req) => {

        const authHeader =
            req.headers.authorization || "";

        const token =
            authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : null;

        if (token && process.env.JWT_SECRET) {

            try {

                const decoded =
                    jwt.verify(
                        token,
                        process.env.JWT_SECRET
                    );

                return decoded.role || null;

            } catch (error) {

                return null;

            }

        }

        return req.body.actor_role || null;

    };

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
                payment_method,
                provider,
                provider_payment_id,
                paid_at

            } = req.body;

            const paymentData =
                {

                    user_name,
                    course_name,
                    amount,
                    payment_method

                };

            const normalizedProvider =
                normalizePaymentProvider(
                    provider
                );

            if (normalizedProvider) {

                paymentData.provider =
                    normalizedProvider;

            }

            if (provider_payment_id) {

                paymentData.provider_payment_id =
                    provider_payment_id;

            }

            if (paid_at) {

                paymentData.paid_at =
                    paid_at;

            }

            const { data, error } =
                await supabase
                    .from("payments")
                    .insert([
                        paymentData
                    ])
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
                status,
                proof_url,
                provider,
                provider_payment_id,
                paid_at,
                actor_role
            } = req.body;

            /* PAYMENT */

            const {
                data: payment,
                error: paymentError
            } =
                await supabase
                    .from("payments")
                    .select("*")
                    .eq("id", id)
                    .single();

            if (paymentError || !payment) {

                return res.status(404).json({
                    error:
                        "Pago no encontrado"
                });

            }

            const updateData =
                {};

            const now =
                getCurrentTimestamp();

            const requestRole =
                getRequestRole(req) ||
                actor_role;

            const isProofUpdate =
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    "proof_url"
                );

            const adminOnlyStatuses =
                [
                    "aprobado",
                    "rechazado",
                    "pendiente"
                ];

            if (
                adminOnlyStatuses.includes(status) &&
                requestRole !== "admin"
            ) {

                return res.status(403).json({
                    error:
                        "Solo el administrador puede aprobar, rechazar o cambiar pagos a pendiente."
                });

            }

            if (
                status === "en_revision" &&
                !isProofUpdate &&
                !payment.proof_url &&
                requestRole !== "admin"
            ) {

                return res.status(400).json({
                    error:
                        "Debes subir un comprobante para enviar el pago a revisión."
                });

            }

            if (status) {

                updateData.status =
                    status;

            }

            const normalizedProvider =
                normalizePaymentProvider(
                    provider
                );

            if (normalizedProvider) {

                updateData.provider =
                    normalizedProvider;

            }

            if (provider_payment_id) {

                updateData.provider_payment_id =
                    provider_payment_id;

            }

            if (paid_at) {

                updateData.paid_at =
                    paid_at;

            }

            if (isProofUpdate) {

                updateData.proof_url =
                    proof_url;

                updateData.provider =
                    "manual";

                updateData.status =
                    "en_revision";

                if (!payment.paid_at) {

                    updateData.paid_at =
                        now;

                }

            }

            if (status === "aprobado") {

                updateData.verified_at =
                    now;

                if (!payment.paid_at && !updateData.paid_at) {

                    updateData.paid_at =
                        now;

                }

            }

            if (
                status === "rechazado" ||
                status === "pendiente"
            ) {

                updateData.verified_at =
                    null;

            }

            const {
                data,
                error
            } =
                await supabase
                    .from("payments")
                    .update(updateData)
                    .eq("id", id)
                    .select()
                    .single();

            if (error) {

                return res
                    .status(400)
                    .json(error);

            }

            /* AUTO UNLOCK */

            if (data.status === "aprobado") {

                const courseUpdate =
                    {
                        unlocked:
                            true
                    };

                if (payment.payment_type === "mentor") {

                    courseUpdate.final_mentorship_approved =
                        true;

                    courseUpdate.final_mentorship_session_id =
                        payment.session_id || null;

                    if (payment.session_id) {

                        await supabase
                            .from("mentor_sessions")
                            .update({
                                status:
                                    "confirmed"
                            })
                            .eq(
                                "id",
                                payment.session_id
                            );

                    }

                }

                await supabase
                    .from("student_courses")
                    .update(courseUpdate)
                    .eq(
                        "student_id",
                        payment.student_id
                    )
                    .eq(
                        "course_id",
                        payment.course_id
                    );

            }

            if (
                (
                    data.status === "rechazado" ||
                    data.status === "pendiente"
                ) &&
                payment.payment_type === "mentor"
            ) {

                await supabase
                    .from("student_courses")
                    .update({
                        final_mentorship_approved:
                            false,
                        final_mentorship_session_id:
                            null
                    })
                    .eq(
                        "student_id",
                        payment.student_id
                    )
                    .eq(
                        "course_id",
                        payment.course_id
                    )
                    .eq(
                        "final_mentorship_session_id",
                        payment.session_id
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
