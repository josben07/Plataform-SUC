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
                areas,
                base_price

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

                const updateData = {
                    photo_url,
                    position,
                    company,
                    experience_years,
                    specialties,
                    description,
                    areas
                };

                if (base_price !== undefined) {
                    updateData.base_price = base_price;
                }

                const { data, error } =
                    await supabase
                        .from("mentor_profiles")
                        .update(updateData)
                        .eq("user_id", user_id)
                        .select()
                        .single();

                if (error) {

                    if (error.message && error.message.includes("column")) {
                        return res.status(400).json({
                            error: "La columna base_price no existe. Ejecuta: ALTER TABLE mentor_profiles ADD COLUMN base_price DECIMAL(10,2) DEFAULT NULL;",
                            needsMigration: true,
                            sql: "ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT NULL;"
                        });
                    }

                    return res.status(400).json(error);

                }

                return res.json(data);

            }

            const insertData = {
                user_id,
                photo_url,
                position,
                company,
                experience_years,
                specialties,
                description,
                areas
            };

            if (base_price !== undefined) {
                insertData.base_price = base_price;
            }

            const { data, error } =
                await supabase
                    .from("mentor_profiles")
                    .insert([insertData])
                    .select()
                    .single();

            if (error) {

                if (error.message && error.message.includes("column")) {
                    return res.status(400).json({
                        error: "La columna base_price no existe. Ejecuta: ALTER TABLE mentor_profiles ADD COLUMN base_price DECIMAL(10,2) DEFAULT NULL;",
                        needsMigration: true,
                        sql: "ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT NULL;"
                    });
                }

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