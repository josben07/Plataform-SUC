const supabase =
    require("../config/supabase");

/* GET PROGRESS */

const getProgress =
    async (req, res) => {

        try {

            const {
                userId,
                courseId
            } = req.params;

            const { data, error } =
                await supabase
                    .from("lesson_progress")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("course_id", courseId);

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

/* COMPLETE LESSON */

const completeLesson =
    async (req, res) => {

        try {

            const {
                user_id,
                lesson_id,
                course_id
            } = req.body;

            const { data: existing } =
                await supabase
                    .from("lesson_progress")
                    .select("*")
                    .eq("user_id", user_id)
                    .eq("lesson_id", lesson_id)
                    .single();

            if (existing) {

                const { data, error } =
                    await supabase
                        .from("lesson_progress")
                        .update({
                            completed: true,
                            completed_at: new Date()
                        })
                        .eq("id", existing.id)
                        .select();

                if (error) {
                    return res.status(400).json(error);
                }

                return res.json(data);

            }

            const { data, error } =
                await supabase
                    .from("lesson_progress")
                    .insert([{
                        user_id,
                        lesson_id,
                        course_id,
                        completed: true,
                        completed_at: new Date()
                    }])
                    .select();

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
    getProgress,
    completeLesson
};