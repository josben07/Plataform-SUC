UPDATE public.project_submissions AS project
SET mentor_id = relation.mentor_id
FROM public.student_mentors AS relation
WHERE project.user_id = relation.student_id
  AND project.course_id = relation.course_id
  AND project.mentor_id IS NULL
  AND relation.status = 'active';
