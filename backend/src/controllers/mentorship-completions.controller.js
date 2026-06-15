const supabase = require("../config/supabase");

async function finalizeCompletion(sessionId) {
    const { data: comp } = await supabase
        .from("mentorship_completions")
        .select("*")
        .eq("session_id", sessionId)
        .single();

    if (!comp) return;

    const mentorDone = comp.mentor_confirmed_at != null;
    const studentDone = comp.student_confirmed_at != null;

    if (!mentorDone || !studentDone) return;

    const { data: session } = await supabase
        .from("mentor_sessions")
        .select("student_id, course_id, mentor_id")
        .eq("id", sessionId)
        .single();

    if (!session) return;

    const courseUpdate = {
        final_mentorship_approved: true,
        final_mentorship_session_id: sessionId
    };

    if (comp.mentor_approved_project) {
        courseUpdate.final_project_approved = true;
    }

    await supabase
        .from("mentor_sessions")
        .update({ status: "completed" })
        .eq("id", sessionId);

    await supabase
        .from("student_courses")
        .update(courseUpdate)
        .eq("student_id", session.student_id)
        .eq("course_id", session.course_id);

    await supabase
        .from("mentorship_completions")
        .update({ completed_at: new Date().toISOString() })
        .eq("session_id", sessionId);
}

const mentorComplete = async (req, res) => {
    try {
        const { session_id, mentor_approved_project, mentor_wants_more, evidence_url } = req.body;
        const mentor_id = req.body.mentor_id || req.user?.id;

        if (!session_id) {
            return res.status(400).json({ error: "Falta session_id." });
        }

        const now = new Date().toISOString();

        const { data: existing } = await supabase
            .from("mentorship_completions")
            .select("id")
            .eq("session_id", session_id)
            .maybeSingle();

        if (existing) {
            await supabase
                .from("mentorship_completions")
                .update({
                    mentor_confirmed_at: now,
                    mentor_evidence_url: evidence_url || null,
                    mentor_approved_project: mentor_approved_project === true || mentor_approved_project === "true",
                    mentor_wants_more: mentor_wants_more === true || mentor_wants_more === "true"
                })
                .eq("id", existing.id);
        } else {
            await supabase
                .from("mentorship_completions")
                .insert([{
                    session_id,
                    mentor_id: mentor_id || null,
                    mentor_confirmed_at: now,
                    mentor_evidence_url: evidence_url || null,
                    mentor_approved_project: mentor_approved_project === true || mentor_approved_project === "true",
                    mentor_wants_more: mentor_wants_more === true || mentor_wants_more === "true"
                }]);
        }

        await finalizeCompletion(session_id);

        res.json({ success: true, message: "Mentoría marcada como completada por el mentor." });
    } catch (err) {
        console.error("[mentorComplete] Error:", err);
        res.status(500).json({ error: err.message });
    }
};

const studentComplete = async (req, res) => {
    try {
        const { session_id, student_wants_more, student_rating, student_comments, evidence_url } = req.body;
        const student_id = req.body.student_id || req.user?.id;

        if (!session_id) {
            return res.status(400).json({ error: "Falta session_id." });
        }

        if (student_rating != null && (student_rating < 1 || student_rating > 5)) {
            return res.status(400).json({ error: "La calificación debe ser entre 1 y 5." });
        }

        const now = new Date().toISOString();

        const { data: existing } = await supabase
            .from("mentorship_completions")
            .select("id")
            .eq("session_id", session_id)
            .maybeSingle();

        if (existing) {
            await supabase
                .from("mentorship_completions")
                .update({
                    student_confirmed_at: now,
                    student_evidence_url: evidence_url || null,
                    student_wants_more: student_wants_more === true || student_wants_more === "true",
                    student_rating: student_rating != null ? Number(student_rating) : null,
                    student_comments: student_comments || null
                })
                .eq("id", existing.id);
        } else {
            const { data: session } = await supabase
                .from("mentor_sessions")
                .select("mentor_id")
                .eq("id", session_id)
                .single();

            await supabase
                .from("mentorship_completions")
                .insert([{
                    session_id,
                    student_id: student_id || null,
                    mentor_id: session?.mentor_id || null,
                    student_confirmed_at: now,
                    student_evidence_url: evidence_url || null,
                    student_wants_more: student_wants_more === true || student_wants_more === "true",
                    student_rating: student_rating != null ? Number(student_rating) : null,
                    student_comments: student_comments || null
                }]);
        }

        await finalizeCompletion(session_id);

        res.json({ success: true, message: "Mentoría confirmada por el alumno." });
    } catch (err) {
        console.error("[studentComplete] Error:", err);
        res.status(500).json({ error: err.message });
    }
};

const getCompletionStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const { data, error } = await supabase
            .from("mentorship_completions")
            .select("*")
            .eq("session_id", sessionId)
            .maybeSingle();

        if (error) {
            return res.status(400).json(error);
        }

        const { data: payment } = await supabase
            .from("payments")
            .select("status")
            .eq("session_id", sessionId)
            .maybeSingle();

        const status = {
            session_id: sessionId,
            mentor_confirmed: data ? data.mentor_confirmed_at != null : false,
            student_confirmed: data ? data.student_confirmed_at != null : false,
            completed: data ? data.completed_at != null : false,
            payment_status: payment ? payment.status : null
        };

        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    mentorComplete,
    studentComplete,
    getCompletionStatus
};
