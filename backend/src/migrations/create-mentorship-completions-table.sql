CREATE TABLE IF NOT EXISTS mentorship_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mentor_sessions(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES users(id),
    student_id UUID REFERENCES users(id),

    mentor_confirmed_at TIMESTAMPTZ,
    mentor_evidence_url TEXT,
    mentor_approved_project BOOLEAN DEFAULT FALSE,
    mentor_wants_more BOOLEAN DEFAULT FALSE,

    student_confirmed_at TIMESTAMPTZ,
    student_evidence_url TEXT,
    student_wants_more BOOLEAN DEFAULT FALSE,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    student_comments TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mentorship_completions_session
    ON mentorship_completions(session_id);
