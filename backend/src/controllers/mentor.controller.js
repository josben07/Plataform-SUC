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

const getCalendlyToken =
    () =>
        process.env.CALENDLY_ACCESS_TOKEN ||
        process.env.CALENDLY_TOKEN ||
        process.env.CALENDLY_API_TOKEN ||
        null;

const fetchCalendlyResource =
    async (uri) => {

        const token =
            getCalendlyToken();

        if (!uri || !token) {

            if (!token) {

                console.warn(
                    "[Calendly] No hay token configurado. Define CALENDLY_ACCESS_TOKEN para sincronizar fecha/hora."
                );

            }

            return null;

        }

        const response =
            await fetch(uri, {

                headers: {
                    Authorization:
                        `Bearer ${token}`,
                    "Content-Type":
                        "application/json"
                }

            });

        const body =
            await response.json().catch(() => ({}));

        if (!response.ok) {

            console.error(
                "[Calendly] Error consultando recurso:",
                response.status,
                body
            );

            return null;

        }

        return body.resource || body;

    };

const getCalendlyEventUri =
    (resource) => {

        if (!resource) {

            return null;

        }

        if (
            typeof resource.event ===
            "string"
        ) {

            return resource.event;

        }

        if (
            resource.event &&
            resource.event.uri
        ) {

            return resource.event.uri;

        }

        if (
            resource.scheduled_event &&
            typeof resource.scheduled_event ===
                "string"
        ) {

            return resource.scheduled_event;

        }

        if (
            resource.scheduled_event &&
            resource.scheduled_event.uri
        ) {

            return resource.scheduled_event.uri;

        }

        return null;

    };

const getCalendlyStartTime =
    (resource) => {

        if (!resource) {

            return null;

        }

        return resource.start_time ||
            resource.startTime ||
            (
                resource.event &&
                (
                    resource.event.start_time ||
                    resource.event.startTime
                )
            ) ||
            (
                resource.scheduled_event &&
                (
                    resource.scheduled_event.start_time ||
                    resource.scheduled_event.startTime
                )
            ) ||
            null;

    };

const getCalendlyTimezone =
    (...resources) => {

        for (const resource of resources) {

            if (!resource) {

                continue;

            }

            const timezone =
                resource.timezone ||
                resource.invitee_timezone ||
                resource.event_timezone ||
                resource.scheduled_event_timezone;

            if (timezone) {

                return timezone;

            }

        }

        return "America/Lima";

    };

const formatCalendlyDate =
    (date, timezone) => {

        const parts =
            new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    timezone,
                year:
                    "numeric",
                month:
                    "2-digit",
                day:
                    "2-digit"
            }
            )
                .formatToParts(date)
                .reduce((values, part) => {

                    values[part.type] =
                        part.value;

                    return values;

                }, {});

        return `${parts.year}-${parts.month}-${parts.day}`;

    };

const formatCalendlyTime =
    (date, timezone) => {

        const parts =
            new Intl.DateTimeFormat(
            "es-PE",
            {
                timeZone:
                    timezone,
                hour:
                    "2-digit",
                minute:
                    "2-digit",
                hour12:
                    false
            }
            )
                .formatToParts(date)
                .reduce((values, part) => {

                    values[part.type] =
                        part.value;

                    return values;

                }, {});

        return `${parts.hour}:${parts.minute}`;

    };

const resolveCalendlySchedule =
    async ({
        session_date,
        session_time,
        calendly_start_time,
        calendly_timezone,
        calendly_event_uri,
        calendly_invitee_uri
    }) => {

        if (session_date && session_time) {

            return {
                session_date,
                session_time
            };

        }

        const inviteeResource =
            await fetchCalendlyResource(
                calendly_invitee_uri
            );

        const eventUri =
            calendly_event_uri ||
            getCalendlyEventUri(
                inviteeResource
            );

        const eventResource =
            await fetchCalendlyResource(
                eventUri
            );

        const startTime =
            calendly_start_time ||
            getCalendlyStartTime(eventResource) ||
            getCalendlyStartTime(inviteeResource);

        if (!startTime) {

            console.warn(
                "[Calendly] No se pudo obtener start_time del evento.",
                {
                    calendly_event_uri,
                    calendly_invitee_uri
                }
            );

            return {
                session_date:
                    session_date || null,
                session_time:
                    session_time || null
            };

        }

        const date =
            new Date(startTime);

        if (Number.isNaN(date.getTime())) {

            return {
                session_date:
                    session_date || null,
                session_time:
                    session_time || null
            };

        }

        const timezone =
            calendly_timezone ||
            getCalendlyTimezone(
                inviteeResource,
                eventResource
            );

        return {
            session_date:
                session_date ||
                formatCalendlyDate(
                    date,
                    timezone
                ),
            session_time:
                session_time ||
                formatCalendlyTime(
                    date,
                    timezone
                )
        };

    };

const getCalendlyUrisFromSession =
    (session) => {

        const description =
            session.session_description || "";

        const eventMatch =
            description.match(
                /Evento:\s*(https?:\/\/\S+)/i
            );

        const inviteeMatch =
            description.match(
                /Invitado:\s*(https?:\/\/\S+)/i
            );

        return {
            calendly_event_uri:
                eventMatch
                    ? eventMatch[1]
                    : null,
            calendly_invitee_uri:
                inviteeMatch
                    ? inviteeMatch[1]
                    : null
        };

    };

const syncCalendlyScheduleForSessions =
    async (sessions) => {

        const syncedSessions =
            [];

        for (const session of sessions) {

            if (
                session.session_date &&
                session.session_time
            ) {

                syncedSessions.push(
                    session
                );

                continue;

            }

            const calendlyUris =
                getCalendlyUrisFromSession(
                    session
                );

            if (
                !calendlyUris.calendly_event_uri &&
                !calendlyUris.calendly_invitee_uri
            ) {

                syncedSessions.push(
                    session
                );

                continue;

            }

            const schedule =
                await resolveCalendlySchedule({
                    session_date:
                        session.session_date,
                    session_time:
                        session.session_time,
                    calendly_event_uri:
                        calendlyUris.calendly_event_uri,
                    calendly_invitee_uri:
                        calendlyUris.calendly_invitee_uri
                });

            if (
                !schedule.session_date ||
                !schedule.session_time
            ) {

                syncedSessions.push(
                    session
                );

                continue;

            }

            const { data: updatedSession, error } =
                await supabase
                    .from("mentor_sessions")
                    .update({
                        session_date:
                            schedule.session_date,
                        session_time:
                            schedule.session_time
                    })
                    .eq("id", session.id)
                    .select()
                    .single();

            if (error) {

                console.error(
                    "[Calendly] Error actualizando fecha/hora de mentoría:",
                    error
                );

                syncedSessions.push(
                    session
                );

                continue;

            }

            syncedSessions.push(
                updatedSession || {
                    ...session,
                    session_date:
                        schedule.session_date,
                    session_time:
                        schedule.session_time
                }
            );

        }

        return syncedSessions;

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

            const syncedData =
                await syncCalendlyScheduleForSessions(
                    data || []
                );

            res.json(syncedData);

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

            const syncedData =
                await syncCalendlyScheduleForSessions(
                    data || []
                );

            res.json(syncedData);

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

            await supabase
                .from("project_submissions")
                .update({
                    mentor_id:
                        session.mentor_id
                })
                .eq("user_id", student_id)
                .eq("course_id", activeCourse.course_id)
                .eq("submission_type", "final_project");

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

            const syncedData =
                await syncCalendlyScheduleForSessions(
                    data || []
                );

            const mentorIds =
                [
                    ...new Set(
                        syncedData
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
                syncedData.map(session => ({

                    ...session,

                    mentor_name:
                        mentorNames[session.mentor_id] ||
                        session.mentor_name ||
                        "Mentor"

                }));

            const courseIds =
                [
                    ...new Set(
                        withNames
                            .filter(s => s.course_id)
                            .map(s => s.course_id)
                    )
                ];

            const courseNames =
                {};

            if (courseIds.length > 0) {

                const { data: courses } =
                    await supabase
                        .from("courses")
                        .select("id,title")
                        .in("id", courseIds);

                if (courses) {

                    courses.forEach(course => {

                        courseNames[course.id] =
                            course.title;

                    });

                }

            }

            const withCourseNames =
                withNames.map(session => ({

                    ...session,

                    course_name:
                        courseNames[session.course_id] ||
                        session.course_name ||
                        null

                }));

            res.json(withCourseNames);

        } catch (err) {

            res.status(500).json({

                error:
                    err.message

            });

        }

    };

/* CANCEL CALENDLY EVENT */

const cancelCalendlyEvent =
    async (calendlyEventUri) => {

        const token =
            getCalendlyToken();

        if (!token || !calendlyEventUri) {

            return;

        }

        try {

            const cancelUrl =
                calendlyEventUri.replace(
                    /\/?$/,
                    "/cancellation"
                );

            const response =
                await fetch(cancelUrl, {

                    method:
                        "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            reason:
                                "Cancelado por el alumno"
                        })

                });

            if (!response.ok) {

                const body =
                    await response.json().catch(() => ({}));

                console.warn(
                    "[Calendly] Error cancelando evento:",
                    response.status,
                    body
                );

            }

        } catch (err) {

            console.warn(
                "[Calendly] Error cancelando evento:",
                err.message
            );

        }

    };

/* CANCEL MENTORSHIP */
const cancelMentorship =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { data: session } =
                await supabase
                    .from("mentor_sessions")
                    .select("id, session_description")
                    .eq("id", id)
                    .maybeSingle();

            if (!session) {

                return res.status(404).json({
                    error:
                        "Mentoría no encontrada."
                });

            }

            const { data: payment } =
                await supabase
                    .from("payments")
                    .select("id, status")
                    .eq("session_id", id)
                    .maybeSingle();

            if (
                payment &&
                payment.status === "aprobado"
            ) {

                return res.status(400).json({
                    error:
                        "No puedes cancelar una mentoría que ya ha sido pagada."
                });

            }

            const calendlyUris =
                getCalendlyUrisFromSession(
                    session
                );

            if (calendlyUris.calendly_event_uri) {

                await cancelCalendlyEvent(
                    calendlyUris.calendly_event_uri
                );

            }

            if (payment) {

                await supabase
                    .from("payments")
                    .delete()
                    .eq("id", payment.id);

            }

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

/* SYNC MISSING PAYMENTS FOR EXISTING MENTORSHIPS */

const syncMentorshipPayments =
    async (req, res) => {

        try {

            const { studentId } =
                req.params;

            if (!studentId) {

                return res.status(400).json({
                    error:
                        "studentId es requerido"
                });

            }

            const { data: sessions, error: sessionsError } =
                await supabase
                    .from("mentor_sessions")
                    .select("*")
                    .eq("student_id", studentId)
                    .in("status", ["reserved", "completed"]);

            if (sessionsError) {

                return res.status(400).json(sessionsError);

            }

            if (!sessions || sessions.length === 0) {

                return res.json({
                    message:
                        "No hay mentorías para sincronizar",
                    created: 0
                });

            }

            const { data: student } =
                await supabase
                    .from("users")
                    .select("full_name")
                    .eq("id", studentId)
                    .maybeSingle();

            const studentName =
                student
                    ? student.full_name
                    : null;

            let createdCount =
                0;

            for (const session of sessions) {

                /* ALWAYS SYNC PRICE FROM MENTOR PROFILE */

                if (session.mentor_id) {

                    const { data: mp, error: mpErr } =
                        await supabase
                            .from("mentor_profiles")
                            .select("base_price")
                            .eq("user_id", session.mentor_id)
                            .maybeSingle();

                    if (mpErr) {
                        console.error("[syncMentorshipPayments] Error leyendo mentor_profiles.base_price:", mpErr);
                    }

                    const mentorBasePrice =
                        mp && mp.base_price != null
                            ? mp.base_price
                            : null;

                    if (
                        mentorBasePrice != null &&
                        Number(mentorBasePrice) !== Number(session.price)
                    ) {

                        const newPrice =
                            Number(mentorBasePrice);

                        await supabase
                            .from("mentor_sessions")
                            .update({ price: newPrice })
                            .eq("id", session.id);

                        session.price =
                            newPrice;

                        /* UPDATE PAYMENT AMOUNT */

                        await supabase
                            .from("payments")
                            .update({
                                amount:
                                    newPrice
                            })
                            .eq("session_id", session.id)
                            .eq("student_id", studentId);

                    }

                }

                const activeCourse =
                    session.course_id
                        ? { course_id: session.course_id }
                        : null;

                try {

                    const result =
                        await createPendingMentorshipPayment({
                            student_id:
                                studentId,
                            student_name:
                                studentName,
                            session,
                            activeCourse
                        });

                    if (result && result.id) {

                        createdCount++;

                    }

                } catch (err) {

                    console.error(
                        "[syncMentorshipPayments] Error en sesión",
                        session.id,
                        err
                    );

                }

            }

            res.json({
                message:
                    "Sincronización completada",
                created:
                    createdCount
            });

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
                course_id,
                calendly_event_uri,
                calendly_invitee_uri,
                calendly_start_time,
                calendly_timezone,
                session_date,
                session_time
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

            const {
                data: student
            } =
                await supabase
                    .from("users")
                    .select("full_name")
                    .eq("id", student_id)
                    .maybeSingle();

            const {
                data: mentor
            } =
                await supabase
                    .from("users")
                    .select("full_name")
                    .eq("id", mentor_id)
                    .maybeSingle();

            const { data: mentorProfile } =
                await supabase
                    .from("mentor_profiles")
                    .select("base_price")
                    .eq("user_id", mentor_id)
                    .maybeSingle();

            const mentorPrice =
                mentorProfile && mentorProfile.base_price
                    ? mentorProfile.base_price
                    : null;

            const courseName =
                await getCourseName(
                    course_id || null,
                    null
                );

            const descriptionParts =
                [
                    "Reserva confirmada desde Calendly."
                ];

            if (calendly_event_uri) {

                descriptionParts.push(
                    `Evento: ${calendly_event_uri}`
                );

            }

            if (calendly_invitee_uri) {

                descriptionParts.push(
                    `Invitado: ${calendly_invitee_uri}`
                );

            }

            const calendlySchedule =
                await resolveCalendlySchedule({
                    session_date,
                    session_time,
                    calendly_start_time,
                    calendly_timezone,
                    calendly_event_uri,
                    calendly_invitee_uri
                });

            if (
                !calendlySchedule.session_date ||
                !calendlySchedule.session_time
            ) {

                return res.status(422).json({
                    error:
                        "No se pudo sincronizar la fecha y hora de Calendly. Configura CALENDLY_ACCESS_TOKEN en backend/.env."
                });

            }

            let meetLink = null;

            if (calendly_event_uri) {

                const eventResource =
                    await fetchCalendlyResource(
                        calendly_event_uri
                    );

                if (
                    eventResource &&
                    eventResource.location &&
                    eventResource.location.join_url
                ) {

                    meetLink =
                        eventResource.location.join_url;

                }

            }

            const insertData = {
                student_id,
                mentor_id,
                course_id:
                    course_id || null,
                student_name:
                    student
                        ? student.full_name
                        : null,
                mentor_name:
                    mentor
                        ? mentor.full_name
                        : null,
                session_title:
                    courseName
                        ? `Mentoría - ${courseName}`
                        : "Mentoría agendada",
                session_description:
                    descriptionParts.join("\n"),
                session_date:
                    calendlySchedule.session_date,
                session_time:
                    calendlySchedule.session_time,
                price:
                    mentorPrice,
                meet_link:
                    meetLink,
                status:
                    "reserved"
            };

            const { data, error } =
                await supabase
                    .from("mentor_sessions")
                    .insert([insertData])
                    .select()
                    .single();

            if (error) {

                console.error(
                    "[POST /api/mentor/book] Supabase insert error:",
                    error
                );

                return res.status(400).json(error);

            }

            /* CREATE PENDING PAYMENT */

            try {

                const activeCourse =
                    course_id
                        ? { course_id }
                        : null;

                await createPendingMentorshipPayment({
                    student_id,
                    student_name:
                        student
                            ? student.full_name
                            : null,
                    session:
                        data,
                    activeCourse
                });

            } catch (paymentError) {

                console.error(
                    "[POST /api/mentor/book] Error creando pago pendiente:",
                    paymentError
                );

            }

            await supabase
                .from("project_submissions")
                .update({
                    mentor_id
                })
                .eq("user_id", student_id)
                .eq("course_id", course_id)
                .eq("submission_type", "final_project");

            res.json(data);

        } catch (err) {

            console.error(
                "[POST /api/mentor/book] Controller error:",
                err
            );

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
    bookMentorship,
    syncMentorshipPayments

};

