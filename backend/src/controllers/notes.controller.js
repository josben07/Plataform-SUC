const supabase = require("../config/supabase");

const getCourseNotes = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .order("updated_at", { ascending: false });

        if (error) {
            return res.status(400).json(error);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getLessonNote = async (req, res) => {
    try {
        const { studentId, courseId, lessonId } = req.params;

        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("lesson_id", lessonId)
            .maybeSingle();

        if (error) {
            return res.status(400).json(error);
        }

        res.json(data || { content: "" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const upsertLessonNote = async (req, res) => {
    try {
        const { studentId, courseId, lessonId } = req.params;
        const { content } = req.body;

        const { data: existing } = await supabase
            .from("notes")
            .select("id")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("lesson_id", lessonId)
            .maybeSingle();

        let result;
        if (existing) {
            result = await supabase
                .from("notes")
                .update({ content, updated_at: new Date().toISOString() })
                .eq("id", existing.id)
                .select()
                .single();
        } else {
            result = await supabase
                .from("notes")
                .insert([{
                    student_id: studentId,
                    course_id: courseId,
                    lesson_id: lessonId,
                    content
                }])
                .select()
                .single();
        }

        if (result.error) {
            return res.status(400).json(result.error);
        }

        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllStudentNotes = async (req, res) => {
    try {
        const { studentId } = req.params;

        const { data, error } = await supabase
            .from("notes")
            .select(`
                *,
                courses!inner(title, thumbnail),
                lessons!inner(title)
            `)
            .eq("student_id", studentId)
            .order("updated_at", { ascending: false });

        if (error) {
            return res.status(400).json(error);
        }

        const notes = (data || []).map(note => ({
            ...note,
            course_title: note.courses?.title || "Curso",
            course_thumbnail: note.courses?.thumbnail || null,
            lesson_title: note.lessons?.title || "Clase"
        }));

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteLessonNote = async (req, res) => {
    try {
        const { studentId, courseId, lessonId } = req.params;

        const { error } = await supabase
            .from("notes")
            .delete()
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("lesson_id", lessonId);

        if (error) {
            return res.status(400).json(error);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllStudentNotes,
    getCourseNotes,
    getLessonNote,
    upsertLessonNote,
    deleteLessonNote
};
