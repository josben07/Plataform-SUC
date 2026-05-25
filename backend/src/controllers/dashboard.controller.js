const supabase =
    require("../config/supabase");

const getDashboardStats =
    async (req, res) => {

        try {

            const { count: usersCount } =
                await supabase
                    .from("users")
                    .select("*", {

                        count: "exact",
                        head: true

                    });

            const { count: coursesCount } =
                await supabase
                    .from("courses")
                    .select("*", {

                        count: "exact",
                        head: true

                    });

            const { count: projectsCount } =
                await supabase
                    .from("project_submissions")
                    .select("*", {

                        count: "exact",
                        head: true

                    })
                    .eq(
                        "status",
                        "pending"
                    );

            const { count: mentorCount } =
                await supabase
                    .from("mentor_sessions")
                    .select("*", {

                        count: "exact",
                        head: true

                    })
                    .eq(
                        "status",
                        "available"
                    );

            const { count: paymentsCount } =
                await supabase
                    .from("payments")
                    .select("*", {

                        count: "exact",
                        head: true

                    })
                    .eq(
                        "status",
                        "pendiente"
                    );

            res.json({

                users:
                    usersCount || 0,

                courses:
                    coursesCount || 0,

                projects:
                    projectsCount || 0,

                mentors:
                    mentorCount || 0,

                payments:
                    paymentsCount || 0

            });

        } catch (error) {

            res.status(500).json({

                error:
                    error.message

            });

        }

    };

module.exports = {

    getDashboardStats

};