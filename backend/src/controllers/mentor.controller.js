const supabase =
    require("../config/supabase");

/* GET */

const getMentorSessions =
    async (req, res) => {

        try {

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
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

const createMentorSession =
    async (req, res) => {

        try {

            const {

                mentor_name,
                mentor_specialty,
                session_title,
                session_description,
                session_date,
                session_time,
                meet_link

            } = req.body;

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .insert([{

                        mentor_name,
                        mentor_specialty,
                        session_title,
                        session_description,
                        session_date,
                        session_time,
                        meet_link

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

const updateMentorSession =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .update(req.body)
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

/* DELETE */

const deleteMentorSession =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { error } =
                await supabase
                    .from("mentor_sessions")
                    .delete()
                    .eq("id", id);

            if (error) {

                return res.status(400).json(error);

            }

            res.json({

                message:
                    "Mentoría eliminada"

            });

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* REQUEST MENTORSHIP */

const requestMentorship =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {

                student_id,
                student_name

            } =
                req.body;

            const {

                data,
                error

            } =
                await supabase
                    .from("mentor_sessions")
                    .update({

                        student_id,
                        student_name,

                        status:
                            "reserved"

                    })
                    .eq("id", id)
                    .select()
                    .single();

            if (error) {

                return res.status(400)
                    .json(error);

            }

            res.json(data);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* CANCEL MENTORSHIP */

const cancelMentorship =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .update({

                        student_id:
                            null,

                        student_name:
                            null,

                        status:
                            "available"

                    })
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

module.exports = {

    getMentorSessions,
    createMentorSession,
    updateMentorSession,
    deleteMentorSession,
    requestMentorship,
    cancelMentorship

};