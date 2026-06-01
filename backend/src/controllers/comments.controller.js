const supabase =
    require("../config/supabase");

/* GET COMMENTS BY LESSON */

const getCommentsByLesson =
    async (req, res) => {

        try {

            const { lessonId } =
                req.params;

            const { data, error } =
                await supabase
                    .from("lesson_comments")
                    .select("*")
                    .eq("lesson_id", lessonId)
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

/* CREATE COMMENT */

const createComment =
    async (req, res) => {

        try {

            const {
                lesson_id,
                user_id,
                user_name,
                comment
            } = req.body;

            const { data, error } =
                await supabase
                    .from("lesson_comments")
                    .insert([{
                        lesson_id,
                        user_id,
                        user_name,
                        comment
                    }])
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
    getCommentsByLesson,
    createComment
};