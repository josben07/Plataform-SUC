const supabase =
    require("../config/supabase");

/* GET ALL MENTORS */

const getMentors =
    async (req, res) => {

        try {

            const { data, error } =
                await supabase
                    .from("users")
                    .select("*")
                    .eq("role", "mentor")
                    .eq("status", "active");

            if (error) {
                return res.status(400).json(error);
            }

            res.json(data);

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }

    };

/* GET STUDENT MENTORS */

const getStudentMentors =
    async (req, res) => {

        try {

            const { studentId } =
                req.params;

            const { data, error } =
                await supabase
                    .from("student_mentors")
                    .select("*")
                    .eq("student_id", studentId);

            if (error) {
                return res.status(400).json(error);
            }

            res.json(data);

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }

    };

/* ASSIGN MENTOR */

const assignMentor =
    async (req, res) => {

        try {

            const {

                student_id,
                mentor_id,
                course_id

            } = req.body;

            const { data: existing } =
                await supabase
                    .from("student_mentors")
                    .select("*")
                    .eq("student_id", student_id)
                    .eq("course_id", course_id)
                    .single();

            if (existing) {

                const { data, error } =
                    await supabase
                        .from("student_mentors")
                        .update({
                            mentor_id,
                            status: "active"
                        })
                        .eq("id", existing.id)
                        .select()
                        .single();

                if (error) {
                    return res.status(400).json(error);
                }

                return res.json(data);

            }

            const { data, error } =
                await supabase
                    .from("student_mentors")
                    .insert([{

                        student_id,
                        mentor_id,
                        course_id,
                        status: "active"

                    }])
                    .select()
                    .single();

            if (error) {
                return res.status(400).json(error);
            }

            res.json(data);

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }

    };

module.exports = {

    getMentors,
    assignMentor,
    getStudentMentors

};