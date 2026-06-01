const supabase =
    require("../config/supabase");

/* GET MENTORS WITH PROFILES */

const getMentorsWithProfiles =
    async (req, res) => {

        try {

            const {
                data: mentors,
                error: mentorsError
            } =
                await supabase
                    .from("users")
                    .select("*")
                    .eq("role", "mentor");

            if (mentorsError) {

                return res.status(400).json(mentorsError);

            }

            const {
                data: profiles,
                error: profilesError
            } =
                await supabase
                    .from("mentor_profiles")
                    .select("*");

            if (profilesError) {

                return res.status(400).json(profilesError);

            }

            const result =
                mentors.map(mentor => {

                    const profile =
                        profiles.find(
                            item =>
                                item.user_id === mentor.id
                        );

                    return {
                        ...mentor,
                        profile:
                            profile || null
                    };

                });

            res.json(result);

        } catch (err) {

            res.status(500).json({
                error:
                    err.message
            });

        }

    };

/* UPSERT PROFILE */

const upsertMentorProfile =
    async (req, res) => {

        try {

            const {

                user_id,
                photo_url,
                position,
                company,
                experience_years,
                specialties,
                description,
                areas

            } = req.body;

            const {
                data: existing
            } =
                await supabase
                    .from("mentor_profiles")
                    .select("*")
                    .eq("user_id", user_id)
                    .single();

            if (existing) {

                const { data, error } =
                    await supabase
                        .from("mentor_profiles")
                        .update({

                            photo_url,
                            position,
                            company,
                            experience_years,
                            specialties,
                            description,
                            areas

                        })
                        .eq("user_id", user_id)
                        .select()
                        .single();

                if (error) {

                    return res.status(400).json(error);

                }

                return res.json(data);

            }

            const { data, error } =
                await supabase
                    .from("mentor_profiles")
                    .insert([{

                        user_id,
                        photo_url,
                        position,
                        company,
                        experience_years,
                        specialties,
                        description,
                        areas

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

    getMentorsWithProfiles,
    upsertMentorProfile

};