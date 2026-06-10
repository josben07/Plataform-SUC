-- Tabla de certificados
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES mentor_profiles(id),
    mentor_name TEXT,
    certificate_number VARCHAR(30) UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, course_id)
);
