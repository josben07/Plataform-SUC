const supabase =
    require("../config/supabase");

/* GET REACTIONS */

const getCommentReactions =
    async (req, res) => {

        try {

            const { commentId } =
                req.params;

            const { data, error } =
                await supabase
                    .from("comment_reactions")
                    .select("*")
                    .eq("comment_id", commentId);

            if (error) {

                return res.status(400).json(error);

            }

            const likes =
                data.filter(
                    item => item.reaction === "like"
                ).length;

            const dislikes =
                data.filter(
                    item => item.reaction === "dislike"
                ).length;

            res.json({
                likes,
                dislikes,
                reactions: data
            });

        } catch (err) {

            res.status(500).json({
                error:
                    err.message
            });

        }

    };

/* REACT */

const reactToComment =
    async (req, res) => {

        try {

            const {
                comment_id,
                user_id,
                reaction
            } = req.body;

            const { data: existing } =
                await supabase
                    .from("comment_reactions")
                    .select("*")
                    .eq("comment_id", comment_id)
                    .eq("user_id", user_id)
                    .single();

            if (existing) {

                const { data, error } =
                    await supabase
                        .from("comment_reactions")
                        .update({
                            reaction
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
                    .from("comment_reactions")
                    .insert([{
                        comment_id,
                        user_id,
                        reaction
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

    reactToComment,
    getCommentReactions

};