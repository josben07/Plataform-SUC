-- Columns required by the final project, mentorship, payment and certificate flow.

ALTER TABLE public.project_submissions
ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'task',
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS feedback TEXT;

ALTER TABLE public.student_courses
ADD COLUMN IF NOT EXISTS final_project_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS final_project_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS final_mentorship_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS final_mentorship_session_id UUID REFERENCES public.mentor_sessions(id);

ALTER TABLE public.mentor_sessions
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id),
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS meet_link TEXT;

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id),
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.mentor_sessions(id),
ADD COLUMN IF NOT EXISTS proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'course',
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_project_submissions_final_project
ON public.project_submissions(user_id, course_id, submission_type, status);

CREATE INDEX IF NOT EXISTS idx_mentor_sessions_student_course
ON public.mentor_sessions(student_id, course_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_session
ON public.payments(session_id);
