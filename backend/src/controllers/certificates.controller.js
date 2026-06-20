const supabase = require("../config/supabase");

const getStudentCertificates = async (req, res) => {
    try {
        const { studentId } = req.params;

        const { data, error } = await supabase
            .from("certificates")
            .select(`
                *,
                courses!inner(title, description, thumbnail),
                users!inner(full_name)
            `)
            .eq("student_id", studentId)
            .order("issued_at", { ascending: false });

        if (error) {
            return res.status(400).json(error);
        }

        const result = (data || []).map(c => ({
            ...c,
            course_title: c.courses?.title || "Curso",
            course_thumbnail: c.courses?.thumbnail || null,
            student_name: c.users?.full_name || "Estudiante"
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const generateCertificate = async (req, res) => {
    try {
        const { student_id, course_id, mentor_id, mentor_name } = req.body;

        if (!student_id || !course_id) {
            return res.status(400).json({ error: "Faltan datos requeridos." });
        }

        const { data: studentCourse, error: studentCourseError } = await supabase
            .from("student_courses")
            .select("*")
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .maybeSingle();

        if (studentCourseError) {
            return res.status(400).json(studentCourseError);
        }

        if (!studentCourse) {
            return res.status(404).json({ error: "Curso del alumno no encontrado." });
        }

        if (studentCourse.status !== "Completed") {
            return res.status(400).json({ error: "El curso debe estar completado para emitir certificado." });
        }

        if (studentCourse.final_project_submitted !== true) {
            return res.status(400).json({ error: "Debes enviar el proyecto final antes de emitir certificado." });
        }

        if (studentCourse.final_project_approved !== true) {
            return res.status(400).json({ error: "El proyecto final debe estar aprobado para emitir certificado." });
        }

        if (studentCourse.final_mentorship_approved !== true) {
            return res.status(400).json({ error: "La mentoría final debe estar realizada y validada para emitir certificado." });
        }

        const { data: finalProject } = await supabase
            .from("project_submissions")
            .select("id")
            .eq("user_id", student_id)
            .eq("course_id", course_id)
            .eq("submission_type", "final_project")
            .eq("status", "approved")
            .limit(1)
            .maybeSingle();

        if (!finalProject) {
            return res.status(400).json({ error: "No existe proyecto final aprobado para este curso." });
        }

        const { data: mentorshipSession } = await supabase
            .from("mentor_sessions")
            .select("id, mentor_id, mentor_name, status")
            .eq("id", studentCourse.final_mentorship_session_id)
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .maybeSingle();

        if (!mentorshipSession || mentorshipSession.status !== "completed") {
            return res.status(400).json({ error: "La mentoría final debe figurar como completada." });
        }

        const { data: existing } = await supabase
            .from("certificates")
            .select("id, certificate_number")
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .maybeSingle();

        if (existing) {
            return res.json(existing);
        }

        const { data: counterData } = await supabase
            .from("certificates")
            .select("certificate_number")
            .order("issued_at", { ascending: false })
            .limit(1);

        let nextNum = 1;
        if (counterData && counterData.length > 0) {
            const lastNum = parseInt(counterData[0].certificate_number.split("-")[2], 10);
            if (!isNaN(lastNum)) {
                nextNum = lastNum + 1;
            }
        }

        const year = new Date().getFullYear();
        const certNumber = `SUC-${year}-${String(nextNum).padStart(4, "0")}`;

        let finalMentorName =
            mentor_name ||
            mentorshipSession.mentor_name ||
            null;

        const finalMentorId =
            mentor_id ||
            mentorshipSession.mentor_id ||
            null;

        if (finalMentorId && !finalMentorName) {
            const { data: mentorUser } = await supabase
                .from("users")
                .select("full_name")
                .eq("id", finalMentorId)
                .maybeSingle();

            if (mentorUser) {
                finalMentorName = mentorUser.full_name;
            }
        }

        const { data, error } = await supabase
            .from("certificates")
            .insert([{
                student_id,
                course_id,
                mentor_id: null,
                mentor_name: finalMentorName,
                certificate_number: certNumber
            }])
            .select()
            .single();

        if (error) {
            return res.status(400).json(error);
        }

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getStudentCertificates,
    generateCertificate
};
