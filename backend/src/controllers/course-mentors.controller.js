const supabase = require("../config/supabase");

const getCourseMentors = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("course_mentors")
            .select("*");

        if (error) {
            return res.status(400).json(error);
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMentorsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const { data, error } = await supabase
            .from("course_mentors")
            .select("mentor_id")
            .eq("course_id", courseId);

        if (error) {
            return res.status(400).json(error);
        }

        const mentorIds = data.map(item => item.mentor_id);
        res.json(mentorIds);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const assignMentorToCourse = async (req, res) => {
    try {
        const { mentor_id, course_id } = req.body;

        if (!mentor_id || !course_id) {
            return res.status(400).json({ error: "mentor_id y course_id son obligatorios" });
        }

        const { data: existing } = await supabase
            .from("course_mentors")
            .select("*")
            .eq("mentor_id", mentor_id)
            .eq("course_id", course_id)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ error: "El mentor ya está asignado a este curso" });
        }

        const { data, error } = await supabase
            .from("course_mentors")
            .insert([{ mentor_id, course_id }])
            .select()
            .single();

        if (error) {
            return res.status(400).json(error);
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const removeCourseMentor = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from("course_mentors")
            .delete()
            .eq("id", id);

        if (error) {
            return res.status(400).json(error);
        }

        res.json({ message: "Asignación eliminada" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCourseMentors,
    getMentorsByCourse,
    assignMentorToCourse,
    removeCourseMentor
};
