const supabase =
    require("../config/supabase");

const normalizeMentorSessionPrice =
    (price) => {

        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {

            return null;

        }

        const numericPrice =
            Number(price);

        return Number.isFinite(numericPrice) &&
            numericPrice >= 0
            ? numericPrice
            : null;

    };

const getActiveStudentCourse =
    async (studentId) => {

        const { data: activeCourse } =
            await supabase
                .from("student_courses")
                .select("*")
                .eq("student_id", studentId)
                .eq("status", "Activo")
                .limit(1)
                .maybeSingle();

        return activeCourse || null;

    };

const getCourseName =
    async (courseId, fallbackName) => {

        if (fallbackName || !courseId) {

            return fallbackName || null;

        }

        const { data: course } =
            await supabase
                .from("courses")
                .select("title")
                .eq("id", courseId)
                .maybeSingle();

        return course
            ? course.title
            : null;

    };

const createPendingMentorshipPayment =
    async ({
        student_id,
        student_name,
        session,
        activeCourse
    }) => {

        const { data: existingPayment } =
            await supabase
                .from("payments")
                .select("id")
                .eq("student_id", student_id)
                .eq("session_id", session.id)
                .maybeSingle();

        if (existingPayment) {

            return existingPayment;

        }

        const courseId =
            activeCourse
                ? activeCourse.course_id
                : null;

        const courseName =
            await getCourseName(
                courseId,
                activeCourse
                    ? activeCourse.course_name
                    : null
            );

        const { data, error } =
            await supabase
                .from("payments")
                .insert([{

                    student_id,

                    course_id:
                        courseId,

                    mentor_id:
                        session.mentor_id,

                    session_id:
                        session.id,

                    user_name:
                        student_name,

                    course_name:
                        courseName,

                    amount:
                        normalizeMentorSessionPrice(
                            session.price
                        ),

                    payment_method:
                        "Simulado",

                    payment_type:
                        "mentor",

                    status:
                        "pendiente"

                }])
                .select()
                .single();

        if (
            error &&
            error.code !== "23505"
        ) {

            throw error;

        }

        return data || existingPayment;

    };

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

const getMentorSessionsByMentor =
    async (req, res) => {

        try {

            const { mentorId } =
                req.params;

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .select("*")
                    .eq("mentor_id", mentorId)
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

                mentor_id,
                mentor_name,
                mentor_specialty,
                session_title,
                session_description,
                session_date,
                session_time,
                price,
                meet_link

            } = req.body;

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .insert([{

                        mentor_id,
                        mentor_name,
                        mentor_specialty,
                        session_title,
                        session_description,
                        session_date,
                        session_time,
                        price:
                            normalizeMentorSessionPrice(
                                price
                            ),
                        status:
                            "available",
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

            const updateData =
                { ...req.body };

            if (
                Object.prototype.hasOwnProperty.call(
                    updateData,
                    "price"
                )
            ) {

                updateData.price =
                    normalizeMentorSessionPrice(
                        updateData.price
                    );

            }

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .update(updateData)
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

                data: session,
                error: sessionError

            } =
                await supabase
                    .from("mentor_sessions")
                    .select("*")
                    .eq("id", id)
                    .single();

            if (sessionError) {

                return res.status(400)
                    .json(sessionError);

            }

            const sessionStatus =
                session.status || "available";

            if (
                sessionStatus !== "available" ||
                session.student_id
            ) {

                return res.status(400).json({
                    error:
                        "Esta mentoría ya fue reservada."
                });

            }

            const activeCourse =
                await getActiveStudentCourse(
                    student_id
                );

            if (!activeCourse) {

                return res.status(400).json({
                    error:
                        "Debes tener un curso activo para agendar una mentoría."
                });

            }

            if (activeCourse.final_project_approved !== true) {

                return res.status(400).json({
                    error:
                        "Debes tener tu proyecto final aprobado para agendar una mentoría."
                });

            }

            const {
                data: assignedMentor
            } =
                await supabase
                    .from("student_mentors")
                    .select("id")
                    .eq("student_id", student_id)
                    .eq("course_id", activeCourse.course_id)
                    .eq("mentor_id", session.mentor_id)
                    .eq("status", "active")
                    .maybeSingle();

            if (!assignedMentor) {

                return res.status(400).json({
                    error:
                        "Debes elegir este mentor para tu curso antes de agendar."
                });

            }

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

            await createPendingMentorshipPayment({
                student_id,
                student_name,
                session:
                    data,
                activeCourse
            });

            res.json(data);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* GET BY STUDENT */

const getStudentMentorships =
    async (req, res) => {

        try {

            const { studentId } =
                req.params;

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .select("*")
                    .eq("student_id", studentId)
                    .order("created_at", {

                        ascending: false

                    });

            if (error) {

                return res.status(400).json(error);

            }

            const mentorIds =
                [
                    ...new Set(
                        data
                            .filter(s => s.mentor_id)
                            .map(s => s.mentor_id)
                    )
                ];

            const mentorNames =
                {};

            if (mentorIds.length > 0) {

                const { data: mentors } =
                    await supabase
                        .from("users")
                        .select("id,full_name")
                        .in("id", mentorIds);

                if (mentors) {

                    mentors.forEach(m => {

                        mentorNames[m.id] =
                            m.full_name;

                    });

                }

            }

            const withNames =
                data.map(session => ({

                    ...session,

                    mentor_name:
                        mentorNames[session.mentor_id] ||
                        session.mentor_name ||
                        "Mentor"

                }));

            res.json(withNames);

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

/* BOOK MENTORSHIP (from Calendly) */

const bookMentorship =
    async (req, res) => {

        try {

            const {
                student_id,
                mentor_id,
                course_id
            } = req.body;

            if (
                !student_id ||
                !mentor_id
            ) {

                return res.status(400).json({
                    error:
                        "student_id y mentor_id son requeridos"
                });

            }

            const insertData = {
                student_id,
                mentor_id,
                status: "reserved"
            };

            if (course_id) {

                insertData.course_id =
                    course_id;

            }

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .insert([insertData])
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
    getMentorSessionsByMentor,
    createMentorSession,
    updateMentorSession,
    deleteMentorSession,
    requestMentorship,
    cancelMentorship,
    getStudentMentorships,
    bookMentorship

};

