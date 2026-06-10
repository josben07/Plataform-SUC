const lessonProjectForm =
    document.getElementById("lessonProjectForm");

const lessonProjectTitle =
    document.getElementById("lessonProjectTitle");

const lessonProjectDescription =
    document.getElementById("lessonProjectDescription");

const lessonTaskTitle =
    document.getElementById("lessonTaskTitle");

const lessonTaskDescription =
    document.getElementById("lessonTaskDescription");

const lessonProjectFile =
    document.getElementById("lessonProjectFile");

const lessonProjectFileName =
    document.getElementById("lessonProjectFileName");

const commentForm =
    document.getElementById("commentForm");

const commentInput =
    document.getElementById("commentInput");

const commentsList =
    document.getElementById("commentsList");

const token =
    localStorage.getItem("token");

const user =
    JSON.parse(localStorage.getItem("user"));

if (!token || !user) {

    window.location.href =
        "../login.html";

}

const params =
    new URLSearchParams(window.location.search);

const courseId =
    params.get("id");

const courseTitle =
    document.getElementById("courseTitle");

const courseDescription =
    document.getElementById("courseDescription");

const modulesList =
    document.getElementById("modulesList");

const lessonTitle =
    document.getElementById("lessonTitle");

const videoBox =
    document.getElementById("videoBox");

const lessonResources =
    document.getElementById("lessonResources");

const completeLessonBtn =
    document.getElementById(
        "completeLessonBtn"
    );

const finishCourseBtn =
    document.getElementById(
        "finishCourseBtn"
    );

const resourcesPanel =
    document.querySelector(".resources-panel");

const commentsPanel =
    document.querySelector(".comments-panel");

const lessonProjectPanel =
    document.querySelector(".lesson-project-panel");

const finalProjectPanel =
    document.getElementById("finalProjectPanel");

const finalProjectStatus =
    document.getElementById("finalProjectStatus");

const finalProjectForm =
    document.getElementById("finalProjectForm");

const finalProjectFile =
    document.getElementById("finalProjectFile");

const finalProjectFileName =
    document.getElementById("finalProjectFileName");

const finalProjectSubmitBtn =
    document.getElementById("finalProjectSubmitBtn");

const notesFab =
    document.getElementById("notesFab");

const notesPanel =
    document.getElementById("notesPanel");

const notesCloseBtn =
    document.getElementById("notesCloseBtn");

const notesTextarea =
    document.getElementById("notesTextarea");

const notesSaveBtn =
    document.getElementById("notesSaveBtn");

const notesSaveFeedback =
    document.getElementById("notesSaveFeedback");

const notesLessonLabel =
    document.getElementById("notesLessonLabel");

const notesList =
    document.getElementById("notesList");

const notesCurrentLesson =
    document.getElementById("notesCurrentLesson");

let allCourseNotes =
    [];

let allModulesData =
    [];

let allLessonsData =
    [];

let currentLessonId =
    null;

let currentLessonData =
    null;

let completedLessons =
    [];
let unlockedLessonIds =
    [];
let currentCourseRelation =
    null;

let finalProjectSubmission =
    null;

function calculateProgressPercent(
    progressData,
    lessonsData
) {

    const lessonIds =
        new Set(
            lessonsData.map(lesson => lesson.id)
        );

    const totalLessons =
        lessonIds.size;

    if (totalLessons === 0) {

        return 0;

    }

    const completedLessonIds =
        new Set(
            progressData
                .filter(item =>
                    item.completed === true &&
                    lessonIds.has(item.lesson_id)
                )
                .map(item => item.lesson_id)
        );

    return Math.min(
        100,
        Math.round(
            (
                completedLessonIds.size /
                totalLessons
            ) * 100
        )
    );

}

function getCurrentProgressPercent() {

    return calculateProgressPercent(
        completedLessons,
        allLessonsData
    );

}

function getLatestFinalProject(projects) {

    const finalProjects =
        projects.filter(project =>
            project.user_id === user.id &&
            project.course_id === courseId &&
            project.submission_type === "final_project"
        );

    const approvedProject =
        finalProjects.find(project =>
            project.status === "approved"
        );

    return approvedProject ||
        finalProjects[0] ||
        null;

}

function updateFinishCourseButton() {

    if (!finishCourseBtn) {

        return;

    }

    const canFinishCourse =
        getCurrentProgressPercent() === 100 &&
        currentCourseRelation &&
        currentCourseRelation.status !== "Completed" &&
        currentCourseRelation.final_project_approved === true &&
        currentCourseRelation.final_mentorship_approved === true;

    finishCourseBtn.classList.toggle(
        "visible-finish-btn",
        canFinishCourse
    );

}

function resetFinalProjectFileState() {

    if (finalProjectFileName) {

        finalProjectFileName.textContent =
            "No hay archivo seleccionado";

    }

    if (finalProjectFile) {

        finalProjectFile.value =
            "";

    }

}

function renderFinalProjectPanel() {

    if (!finalProjectPanel) {

        return;

    }

    const isCourseLevelView =
        currentLessonId === null;

    const courseReadyForFinalProject =
        isCourseLevelView &&
        getCurrentProgressPercent() === 100 &&
        currentCourseRelation &&
        currentCourseRelation.status !== "Completed";

    finalProjectPanel.style.display =
        courseReadyForFinalProject
            ? "block"
            : "none";

    if (!courseReadyForFinalProject) {

        return;

    }

    finalProjectStatus.className =
        "final-project-status";

    finalProjectStatus.innerHTML =
        "";

    finalProjectForm.style.display =
        "flex";

    finalProjectSubmitBtn.textContent =
        "Enviar proyecto final";

    if (!finalProjectSubmission) {

        return;

    }

    if (finalProjectSubmission.status === "pending") {

        finalProjectStatus.classList.add(
            "visible-status",
            "pending"
        );

        finalProjectStatus.textContent =
            "Proyecto final pendiente de revisión.";

        finalProjectForm.style.display =
            "none";

        return;

    }

    if (finalProjectSubmission.status === "rejected") {

        finalProjectStatus.classList.add(
            "visible-status",
            "rejected"
        );

        finalProjectStatus.innerHTML = `
            Proyecto final rechazado.
            ${finalProjectSubmission.feedback
                ? `<br>Feedback: ${finalProjectSubmission.feedback}`
                : ""}
        `;

        finalProjectSubmitBtn.textContent =
            "Reenviar proyecto final";

        return;

    }

    if (finalProjectSubmission.status === "approved") {

        finalProjectStatus.classList.add(
            "visible-status",
            "approved"
        );

        if (
            currentCourseRelation &&
            currentCourseRelation.final_mentorship_approved === true
        ) {

            finalProjectStatus.innerHTML = `
            Proyecto final aprobado.
            <br>
            Mentoria final validada. Ya puedes finalizar el curso.
        `;

            finalProjectForm.style.display =
                "none";

            updateFinishCourseButton();

            return;

        }

        finalProjectStatus.innerHTML = `
            Proyecto final aprobado.
            <br>
            <button
                class="final-project-action"
                onclick="window.location.href='./mentorships.html'"
            >
                Agendar mentoría
            </button>
        `;

        finalProjectForm.style.display =
            "none";

    }

}

async function loadFinalProjectStatus() {

    if (getCurrentProgressPercent() !== 100) {

        finalProjectSubmission =
            null;

        renderFinalProjectPanel();

        return;

    }

    const response =
        await fetch(
            `${API_URL}/api/projects`
        );

    const projects =
        await response.json();

    finalProjectSubmission =
        getLatestFinalProject(
            projects
        );

    if (
        finalProjectSubmission &&
        finalProjectSubmission.status === "approved" &&
        currentCourseRelation
    ) {

        currentCourseRelation.final_project_approved =
            true;

    }

    renderFinalProjectPanel();

}

function scrollToFinalProjectPanel() {

    if (!finalProjectPanel) {

        return;

    }

    finalProjectPanel.scrollIntoView({
        behavior:
            "smooth",
        block:
            "start"
    });

}


async function validateCourseAccess() {

    const response =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    const studentCourses =
        await response.json();

    currentCourseRelation =
        studentCourses.find(
            item =>
                item.course_id === courseId
        );

    if (
        !currentCourseRelation ||
        currentCourseRelation.status === "Bloqueado"
    ) {

        showCourseMessage(
            "Ya tienes un curso en progreso. Completa el actual para acceder a otros."
        );

        window.location.href =
            "./dashboard.html";

        return false;

    }

    return true;

}

async function getSelectedCourseMentor() {

    const response =
        await fetch(
            `${API_URL}/api/student-mentors/${user.id}`
        );

    if (!response.ok) {

        return null;

    }

    const studentMentors =
        await response.json();

    return studentMentors.find(item =>
        String(item.course_id) === String(courseId) &&
        item.status === "active" &&
        item.mentor_id
    );

}

/* LOAD COURSE */

async function loadCourse() {

    const response =
        await fetch(`${API_URL}/api/courses`);

    const courses =
        await response.json();

    const course =
        courses.find(c => c.id === courseId);

    if (course) {

        courseTitle.textContent =
            course.title;

        courseDescription.textContent =
            course.description || "";

    }

}

function calculateUnlockedLessons() {

    unlockedLessonIds =
        [];

    if (allLessonsData.length === 0) {

        return;

    }

    unlockedLessonIds.push(
        allLessonsData[0].id
    );

    for (let i = 0; i < allLessonsData.length; i++) {

        const lesson =
            allLessonsData[i];

        const isCompleted =
            completedLessons.some(
                item =>
                    item.lesson_id === lesson.id &&
                    item.completed === true
            );

        if (isCompleted && allLessonsData[i + 1]) {

            unlockedLessonIds.push(
                allLessonsData[i + 1].id
            );

        }

    }

}

/* LOAD MODULES */

async function loadModules() {

    const response =
        await fetch(
            `${API_URL}/api/modules/${courseId}`
        );

    const modules =
        await response.json();

    allModulesData =
        modules;

    allLessonsData =
        [];

    modulesList.innerHTML = "";

    modules.forEach((module, moduleIndex) => {

        modulesList.innerHTML += `

            <div class="player-module">

                <div class="player-module-header">
                    Módulo ${moduleIndex + 1}: ${module.title}
                </div>

                <div
                    class="player-lessons"
                    id="lessons-${module.id}"
                ></div>

            </div>

        `;

    });

    const lessonsByModule =
        await Promise.all(
            modules.map((module, moduleIndex) =>
                loadLessons(module.id, moduleIndex)
            )
        );

    const orderedLessons =
        lessonsByModule
            .flat()
            .sort((a, b) => {

                if (a.moduleIndex !== b.moduleIndex) {

                    return a.moduleIndex - b.moduleIndex;

                }

                return a.lessonIndex - b.lessonIndex;

            });

    allLessonsData =
        orderedLessons.map(item => item.lesson);

    orderedLessons.forEach(item => {

        renderLessonButton(
            item.lesson,
            item.moduleId,
            item.moduleIndex,
            item.lessonIndex
        );

    });

}

/* LOAD LESSONS */

async function loadLessons(moduleId, moduleIndex) {

    const response =
        await fetch(
            `${API_URL}/api/lessons/${moduleId}`
        );

    const lessons =
        await response.json();

    return lessons.map((lesson, lessonIndex) => ({
        lesson,
        moduleId,
        moduleIndex,
        lessonIndex
    }));

}

function renderLessonButton(
    lesson,
    moduleId,
    moduleIndex,
    lessonIndex
) {

    const container =
        document.getElementById(`lessons-${moduleId}`);

    if (!container) {

        return;

    }

    container.innerHTML += `

<button
    class="player-lesson"
    id="lesson-${lesson.id}"
    data-lesson-id="${lesson.id}"
    onclick='handleLessonClick(${JSON.stringify(lesson)})'
>
        <span>
            ${moduleIndex + 1}.${lessonIndex + 1}
        </span>

        ${lesson.title}
    </button>

`;

}

async function validateLessonRequirements() {

    if (
        !currentLessonData ||
        currentLessonData.requires_task !== true
    ) {

        return true;

    }

    const projectsResponse =
        await fetch(
            `${API_URL}/api/projects`
        );

    const projects =
        await projectsResponse.json();

    const lessonProject =
        projects.find(project =>
            project.user_id === user.id &&
            project.course_id === courseId &&
            project.lesson_id === currentLessonId &&
            project.submission_type === "task"
        );

    if (!lessonProject) {

        showCourseMessage(
            "Debes guardar la tarea de esta clase antes de completarla."
        );

        return false;

    }

    return true;

}

function updateLessonTaskPanel(lesson) {

    const requiresTask =
        lesson.requires_task === true;

    if (!lessonProjectPanel) {

        return;

    }

    lessonProjectPanel.style.display =
        requiresTask
            ? "block"
            : "none";

    if (!requiresTask) {

        lessonProjectForm.reset();
        resetLessonProjectFileState();
        return;

    }

    lessonTaskTitle.textContent =
        lesson.task_title ||
        "Tarea de la clase";

    lessonTaskDescription.textContent =
        lesson.task_description ||
        "Sube el archivo de tu tarea para poder avanzar a la siguiente clase.";

}

/* OPEN LESSON */

async function openLesson(lesson) {

    currentLessonId =
        lesson.id;

    currentLessonData =
        lesson;

    showLessonView();

    document
        .querySelectorAll(".player-lesson")
        .forEach(button => {

            button.classList.remove(
                "active-lesson"
            );

        });

    const activeLesson =
        document.getElementById(
            `lesson-${lesson.id}`
        );

    if (activeLesson) {

        activeLesson.classList.add(
            "active-lesson"
        );

    }

    const isCompleted =
        completedLessons.some(
            item =>
                item.lesson_id === lesson.id &&
                item.completed === true
        );

    if (isCompleted) {

        completeLessonBtn.textContent =
            "Clase completada";

        completeLessonBtn.classList.add(
            "completed-btn"
        );

    } else {

        completeLessonBtn.textContent =
            "Marcar como completada";

        completeLessonBtn.classList.remove(
            "completed-btn"
        );

    }

    updateFinishCourseButton();

    lessonTitle.textContent =
        lesson.title;

    updateLessonTaskPanel(
        lesson
    );

    if (lesson.video_url) {

        videoBox.innerHTML = getVideoPlayer(
            lesson.video_url
        );

    } else {

        videoBox.innerHTML = `
        <div class="empty-video">
            Sin video disponible
        </div>
    `;

    }

    function getVideoPlayer(videoUrl) {

        let url =
            videoUrl.trim();

        if (url.includes("youtube.com/watch?v=")) {

            const videoId =
                url.split("v=")[1].split("&")[0];

            return `
            <iframe
                src="https://www.youtube.com/embed/${videoId}"
                class="course-video-frame"
                allowfullscreen
            ></iframe>
        `;
        }

        if (url.includes("youtu.be/")) {

            const videoId =
                url.split("youtu.be/")[1].split("?")[0];

            return `
            <iframe
                src="https://www.youtube.com/embed/${videoId}"
                class="course-video-frame"
                allowfullscreen
            ></iframe>
        `;
        }

        if (url.includes("vimeo.com/")) {

            const videoId =
                url.split("vimeo.com/")[1].split("?")[0];

            return `
            <iframe
                src="https://player.vimeo.com/video/${videoId}"
                class="course-video-frame"
                allowfullscreen
            ></iframe>
        `;
        }

        if (url.includes("drive.google.com")) {

            let driveUrl =
                url;

            if (url.includes("/view")) {

                driveUrl =
                    url.replace(
                        "/view",
                        "/preview"
                    );

            }

            return `
            <iframe
                src="${driveUrl}"
                class="course-video-frame"
                allowfullscreen
            ></iframe>
        `;
        }

        if (
            url.endsWith(".mp4") ||
            url.endsWith(".webm") ||
            url.endsWith(".ogg")
        ) {

            return `
            <video
                class="course-video-frame"
                controls
            >
                <source src="${url}">
                Tu navegador no soporta este video.
            </video>
        `;
        }

        return `
        <iframe
            src="${url}"
            class="course-video-frame"
            allowfullscreen
        ></iframe>
    `;

    }

    loadResources(lesson.id);
    loadComments(lesson.id);

    if (notesPanel.classList.contains("open")) {
        loadCurrentLessonNote();
    }

}

/* LOAD RESOURCES */

async function loadResources(lessonId) {

    if (resourcesPanel) {

        resourcesPanel.style.display =
            "none";

    }

    const response =
        await fetch(
            `${API_URL}/api/resources/${lessonId}`
        );

    const resources =
        await response.json();

    lessonResources.innerHTML = "";

    if (resources.length === 0) {

        return;

    }

    if (resourcesPanel) {

        resourcesPanel.style.display =
            "block";

    }

    resources.forEach(resource => {

        lessonResources.innerHTML += `

            <a
                href="${resource.file_url}"
                target="_blank"
                class="resource-link"
            >
                <span>
                    📄 ${resource.title}
                </span>

                <span>
                    Abrir
                </span>
            </a>

        `;

    });

}

async function loadProgress() {

    const response =
        await fetch(
            `${API_URL}/api/progress/${user.id}/${courseId}`
        );

    completedLessons =
        await response.json();

    updateFinishCourseButton();

    if (allLessonsData.length > 0) {

        await loadFinalProjectStatus();

    }

}

/* ========================= */
/* NOTES */
/* ========================= */

let currentNoteContent =
    "";

function findLessonTitle(lessonId) {

    const lesson =
        allLessonsData.find(l => l.id === lessonId);

    if (lesson) {

        return lesson.title;

    }

    return `Clase ${lessonId}`;

}

async function loadCurrentLessonNote() {

    if (!currentLessonId) {

        notesLessonLabel.textContent =
            "Selecciona una clase para tomar apuntes";

        notesTextarea.value =
            "";

        notesTextarea.disabled =
            true;

        notesSaveBtn.style.display =
            "none";

        currentNoteContent =
            "";

        return;

    }

    notesLessonLabel.textContent =
        `Apuntes: ${currentLessonData.title}`;

    notesTextarea.disabled =
        false;

    notesSaveBtn.style.display =
        "block";

    try {

        const response =
            await fetch(
                `${API_URL}/api/notes/${user.id}/${courseId}/${currentLessonId}`
            );

        const note =
            await response.json();

        notesTextarea.value =
            note.content || "";

        currentNoteContent =
            note.content || "";

        notesSaveFeedback.textContent =
            "";

    } catch (err) {

        notesTextarea.value =
            "";

        currentNoteContent =
            "";

    }

}

async function saveNote() {

    const content =
        notesTextarea.value.trim();

    if (!currentLessonId) {

        notesSaveFeedback.className =
            "notes-save-feedback error";

        notesSaveFeedback.textContent =
            "No hay clase seleccionada.";

        return;

    }

    const originalText =
        notesSaveBtn.textContent;

    notesSaveBtn.disabled =
        true;

    notesSaveBtn.textContent =
        "Guardando...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/notes/${user.id}/${courseId}/${currentLessonId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            content
                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "No se pudieron guardar los apuntes."
            );

        }

        await response.json();

        currentNoteContent =
            content;

        notesSaveFeedback.className =
            "notes-save-feedback success";

        notesSaveFeedback.textContent =
            "✓ Apuntes guardados";

        await loadAllCourseNotes();

        setTimeout(() => {

            notesSaveFeedback.textContent =
                "";

        }, 2000);

    } catch (err) {

        notesSaveFeedback.className =
            "notes-save-feedback error";

        notesSaveFeedback.textContent =
            "Error al guardar apuntes.";

    } finally {

        notesSaveBtn.disabled =
            false;

        notesSaveBtn.textContent =
            originalText;

    }

}

async function loadAllCourseNotes() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/notes/${user.id}/${courseId}`
            );

        allCourseNotes =
            await response.json();

        renderAllCourseNotes();

    } catch (err) {

        allCourseNotes =
            [];

        notesList.innerHTML = `
            <div class="notes-empty">
                No se pudieron cargar los apuntes.
            </div>
        `;

    }

}

function renderAllCourseNotes() {

    if (!allCourseNotes || allCourseNotes.length === 0) {

        notesList.innerHTML = `
            <div class="notes-empty">
                Aún no tienes apuntes en este curso.
            </div>
        `;

        return;

    }

    notesList.innerHTML =
        "";

    allCourseNotes.forEach(note => {

        const date =
            new Date(note.updated_at || note.created_at);

        const formattedDate =
            date.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

        const lessonTitle =
            findLessonTitle(note.lesson_id);

        const preview =
            (note.content || "").substring(
                0,
                120
            );

        notesList.innerHTML += `
            <div
                class="notes-list-item"
                data-lesson-id="${note.lesson_id}"
            >
                <div class="notes-list-item-title">
                    ${lessonTitle}
                </div>
                <div class="notes-list-item-preview">
                    ${preview}
                </div>
                <div class="notes-list-item-date">
                    ${formattedDate}
                </div>
            </div>
        `;

    });

    document
        .querySelectorAll(".notes-list-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const lessonId =
                        item.dataset.lessonId;

                    const lesson =
                        allLessonsData.find(
                            l => l.id === lessonId
                        );

                    if (lesson) {

                        openLesson(lesson);

                        notesPanel.classList.remove(
                            "open"
                        );

                    }

                }
            );

        });

}

function toggleNotesPanel() {

    notesPanel.classList.toggle(
        "open"
    );

    if (
        notesPanel.classList.contains(
            "open"
        )
    ) {

        loadCurrentLessonNote();
        loadAllCourseNotes();

    }

}

notesFab.addEventListener(
    "click",
    toggleNotesPanel
);

notesCloseBtn.addEventListener(
    "click",
    toggleNotesPanel
);

notesSaveBtn.addEventListener(
    "click",
    saveNote
);

document.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "Escape" &&
            notesPanel.classList.contains(
                "open"
            )
        ) {

            toggleNotesPanel();

        }

    }
);

completeLessonBtn.addEventListener(
    "click",
    async () => {

        if (!currentLessonId) {

            return;

        }

        const canComplete =
            await validateLessonRequirements();

        if (!canComplete) {

            return;

        }

        const progressBeforeComplete =
            getCurrentProgressPercent();

        await fetch(
            `${API_URL}/api/progress/complete`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        user_id:
                            user.id,

                        lesson_id:
                            currentLessonId,

                        course_id:
                            courseId
                    })
            }
        );

        await loadProgress();
        refreshLessonLocks();
        updateFinishCourseButton();

        const progressAfterComplete =
            getCurrentProgressPercent();

        if (
            progressBeforeComplete < 100 &&
            progressAfterComplete === 100
        ) {

            showWelcomeView();

            await loadFinalProjectStatus();

            showCourseMessage(
                "Has completado todas las clases. Ahora sube tu proyecto final."
            );

            setTimeout(
                scrollToFinalProjectPanel,
                100
            );

        }

        completeLessonBtn.textContent =
            "Clase completada";

        completeLessonBtn.classList.add(
            "completed-btn"
        );

    }
);

async function loadComments(lessonId) {

    const response =
        await fetch(
            `${API_URL}/api/comments/${lessonId}`
        );

    const comments =
        await response.json();

    commentsList.innerHTML =
        "";

    if (comments.length === 0) {

        commentsList.innerHTML = `

            <div class="empty-comments">
                Aún no hay comentarios en esta clase.
            </div>

        `;

        return;

    }

    for (const comment of comments) {

        const reactionsResponse =
            await fetch(
                `${API_URL}/api/comment-reactions/${comment.id}`
            );

        const reactions =
            await reactionsResponse.json();

        commentsList.innerHTML += `

            <div class="comment-card">

                <div class="comment-avatar">
                    ${comment.user_name.charAt(0)}
                </div>

                <div>

                    <strong>
                        ${comment.user_name}
                    </strong>

                    <p>
                        ${comment.comment}
                    </p>

                    <div class="comment-reactions">

                        <button
                            onclick="reactToComment('${comment.id}','like')"
                        >
                            👍 ${reactions.likes}
                        </button>

                        <button
                            onclick="reactToComment('${comment.id}','dislike')"
                        >
                            👎 ${reactions.dislikes}
                        </button>

                    </div>

                </div>

            </div>

        `;

    }

}

commentForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        if (!currentLessonId) {

            return;

        }

        if (commentInput.value.trim() === "") {

            return;

        }

        await fetch(
            `${API_URL}/api/comments`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        lesson_id:
                            currentLessonId,

                        user_id:
                            user.id,

                        user_name:
                            user.full_name,

                        comment:
                            commentInput.value.trim()

                    })
            }
        );

        commentInput.value =
            "";

        loadComments(
            currentLessonId
        );

    }
);

async function reactToComment(

    commentId,
    reaction

) {

    await fetch(
        `${API_URL}/api/comment-reactions`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({

                    comment_id:
                        commentId,

                    user_id:
                        user.id,

                    reaction:
                        reaction

                })
        }
    );

    if (currentLessonId) {

        loadComments(
            currentLessonId
        );

    }

}

function showWelcomeView() {

    currentLessonId =
        null;

    currentLessonData =
        null;

    const isCompleted =
        currentCourseRelation &&
        currentCourseRelation.status === "Completed";

    lessonTitle.textContent =
        isCompleted
            ? "¡Curso completado!"
            : "Bienvenido al curso";

    completeLessonBtn.style.display =
        "none";

    if (resourcesPanel) {
        resourcesPanel.style.display =
            "none";
    }

    if (commentsPanel) {
        commentsPanel.style.display =
            "none";
    }

    if (lessonProjectPanel) {
        lessonProjectPanel.style.display =
            "none";
    }

    updateFinishCourseButton();

    const totalLessons =
        new Set(
            allLessonsData.map(lesson => lesson.id)
        ).size;

    const progressPercent =
        getCurrentProgressPercent();

    if (isCompleted && finalProjectPanel) {
        finalProjectPanel.style.display = "none";
    } else {
        renderFinalProjectPanel();
    }

    videoBox.innerHTML = isCompleted ? `

        <div class="course-welcome-box">

            <div class="welcome-icon">
                🎉
            </div>

            <h2>
                ¡Completaste el curso!
            </h2>

            <p>
                Has finalizado todas las etapas del curso.
                Explora más contenido o revisa tus clases nuevamente.
            </p>

            <div class="welcome-progress">

                <div class="welcome-progress-info">

                    <span>
                        Progreso final
                    </span>

                    <strong>
                        ${progressPercent}%
                    </strong>

                </div>

                <div class="welcome-progress-bar">

                    <div
                        class="welcome-progress-fill"
                        style="width:${progressPercent}%;"
                    ></div>

                </div>

            </div>

            <button
                class="welcome-start-btn"
                onclick="startFirstLesson()"
            >
                Repasar clases
            </button>

        </div>

    ` : `

        <div class="course-welcome-box">

            <div class="welcome-icon">
                🚀
            </div>

            <h2>
                Empieza tu ruta de aprendizaje
            </h2>

            <p>
                Este curso cuenta con
                <strong>${allModulesData.length}</strong>
                módulos y
                <strong>${totalLessons}</strong>
                clases disponibles.
            </p>

            <div class="welcome-progress">

                <div class="welcome-progress-info">

                    <span>
                        Progreso actual
                    </span>

                    <strong>
                        ${progressPercent}%
                    </strong>

                </div>

                <div class="welcome-progress-bar">

                    <div
                        class="welcome-progress-fill"
                        style="width:${progressPercent}%;"
                    ></div>

                </div>

            </div>

            <button
                class="welcome-start-btn"
                onclick="startFirstLesson()"
            >
                Comenzar primera clase
            </button>

        </div>

    `;

}

function showLessonView() {

    completeLessonBtn.style.display =
        "inline-flex";

    if (finalProjectPanel) {
        finalProjectPanel.style.display =
            "none";
    }

    if (resourcesPanel) {
        resourcesPanel.style.display =
            "none";
    }

    if (commentsPanel) {
        commentsPanel.style.display =
            "block";
    }

}

if (finishCourseBtn) {

    finishCourseBtn.addEventListener(
        "click",
        async () => {

            if (
                !currentCourseRelation ||
                currentCourseRelation.final_project_approved !== true ||
                currentCourseRelation.final_mentorship_approved !== true
            ) {

                showCourseMessage(
                    "Primero debes completar el flujo de proyecto final y mentoría."
                );

                return;

            }

            if (getCurrentProgressPercent() < 100) {

                showCourseMessage(
                    "Completa todas las clases antes de finalizar el curso."
                );

                return;

            }

            const response =
                await fetch(
                    `${API_URL}/api/student-courses/complete`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                student_id:
                                    user.id,

                                course_id:
                                    courseId
                            })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                showCourseMessage(
                    result.error ||
                    "No se pudo finalizar el curso."
                );

                return;

            }

            currentCourseRelation =
                result;

            updateFinishCourseButton();

            showWelcomeView();

            showCourseMessage(
                "Curso finalizado correctamente."
            );

            try {

                const mentorRes =
                    await fetch(
                        `${API_URL}/api/student-mentors/${user.id}`
                    );

                const mentors =
                    await mentorRes.json();

                const mentor =
                    mentors.find(
                        m => m.course_id === courseId && m.status === "active"
                    );

                const certRes =
                    await fetch(
                        `${API_URL}/api/certificates/generate`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    student_id:
                                        user.id,
                                    course_id:
                                        courseId,
                                    mentor_id:
                                        mentor
                                            ? mentor.mentor_id
                                            : null,
                                    mentor_name:
                                        mentor
                                            ? mentor.mentor_name
                                            : null
                                })
                        }
                    );

                const cert =
                    await certRes.json();

                if (cert && cert.id) {

                    setTimeout(() => {

                        window.open(
                            `./certificate.html?id=${cert.id}`,
                            '_blank'
                        );

                    }, 1500);

                }

            } catch (e) {

                console.error(
                    "Error generando certificado:",
                    e
                );

            }

        }
    );

}

function startFirstLesson() {

    if (allLessonsData.length === 0) {

        return;

    }

    openLesson(
        allLessonsData[0]
    );

}

function refreshLessonLocks() {

    unlockedLessonIds =
        allLessonsData.map(
            lesson => lesson.id
        );

    document
        .querySelectorAll(".player-lesson")
        .forEach(button => {

            button.classList.remove(
                "locked-lesson"
            );

            const existingLock =
                button.querySelector(".lesson-lock");

            if (existingLock) {

                existingLock.remove();

            }

        });

}

function handleLessonClick(lesson) {

    openLesson(lesson);

}

function showCourseMessage(message) {

    const toast =
        document.querySelector(".app-toast");

    const toastMessage =
        document.getElementById("appToastMessage");

    if (!toast || !toastMessage) {

        alert(message);
        return;

    }

    toastMessage.textContent =
        message;

    toast.classList.add(
        "show-toast"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show-toast"
        );

    }, 3000);

}

function resetLessonProjectFileState() {

    if (lessonProjectFileName) {

        lessonProjectFileName.textContent =
            "No hay archivo seleccionado";

    }

}

async function uploadLessonProjectFile(file) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    const response =
        await fetch(
            `${API_URL}/api/uploads/submissions`,
            {
                method:
                    "POST",
                body:
                    formData
            }
        );

    const result =
        await response.json();

    if (
        !response.ok ||
        !result.url
    ) {

        const message =
            typeof result.error === "string"
                ? result.error
                : "No se pudo subir el archivo.";

        throw new Error(message);

    }

    return result.url;

}

lessonProjectFile.addEventListener(
    "change",
    () => {

        const file =
            lessonProjectFile.files[0];

        lessonProjectFileName.textContent =
            file
                ? file.name
                : "No hay archivo seleccionado";

    }
);

if (finalProjectFile) {

    finalProjectFile.addEventListener(
        "change",
        () => {

            const file =
                finalProjectFile.files[0];

            finalProjectFileName.textContent =
                file
                    ? file.name
                    : "No hay archivo seleccionado";

        }
    );

}

if (finalProjectForm) {

    finalProjectForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            if (getCurrentProgressPercent() !== 100) {

                showCourseMessage(
                    "Completa todas las clases antes de enviar el proyecto final."
                );

                return;

            }

            const file =
                finalProjectFile.files[0];

            if (!file) {

                showCourseMessage(
                    "Selecciona un archivo antes de enviar el proyecto final."
                );

                return;

            }

            const selectedMentor =
                await getSelectedCourseMentor();

            if (!selectedMentor) {

                showCourseMessage(
                    "Primero debes elegir un mentor para enviar tu proyecto final."
                );

                return;

            }

            const originalText =
                finalProjectSubmitBtn.textContent;

            finalProjectSubmitBtn.disabled =
                true;

            finalProjectSubmitBtn.textContent =
                "Subiendo proyecto final...";

            try {

                const uploadedUrl =
                    await uploadLessonProjectFile(
                        file
                    );

                const response =
                    await fetch(
                        `${API_URL}/api/projects`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    user_id:
                                        user.id,
                                    course_id:
                                        courseId,
                                    lesson_id:
                                        null,
                                    title:
                                        "Proyecto Final del Curso",
                                    description:
                                        "Proyecto final enviado desde el curso.",
                                    project_url:
                                        uploadedUrl,
                                    submission_type:
                                        "final_project",
                                    status:
                                        "pending"
                                })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "No se pudo guardar el proyecto final."
                    );

                }

                currentCourseRelation.final_project_submitted =
                    true;

                resetFinalProjectFileState();

                showCourseMessage(
                    "Proyecto final enviado correctamente."
                );

                await loadFinalProjectStatus();

            } catch (error) {

                console.error(error);

                showCourseMessage(
                    error.message ||
                    "No se pudo enviar el proyecto final."
                );

            } finally {

                finalProjectSubmitBtn.disabled =
                    false;

                finalProjectSubmitBtn.textContent =
                    originalText;

            }

        }
    );

}

lessonProjectForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        if (!currentLessonId) {

            showCourseMessage(
                "Selecciona una clase antes de guardar una tarea."
            );

            return;

        }

        if (
            !currentLessonData ||
            currentLessonData.requires_task !== true
        ) {

            showCourseMessage(
                "Esta clase no requiere tarea."
            );

            return;

        }

        const file =
            lessonProjectFile.files[0];

        if (!file) {

            showCourseMessage(
                "Selecciona un archivo antes de guardar la tarea."
            );

            return;

        }

        const submitButton =
            lessonProjectForm.querySelector(
                "button"
            );

        const originalText =
            submitButton.textContent;

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Guardando tarea...";

        try {

            const uploadedUrl =
                await uploadLessonProjectFile(
                    file
                );

            const response =
                await fetch(
                    `${API_URL}/api/projects`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                user_id:
                                    user.id,

                                course_id:
                                    courseId,

                                lesson_id:
                                    currentLessonId,

                                title:
                                    lessonProjectTitle.value,

                                description:
                                    lessonProjectDescription.value,

                                project_url:
                                    uploadedUrl,

                                submission_type:
                                    "task",

                                status:
                                    "pending"

                            })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "No se pudo guardar la tarea."
                );

            }

            lessonProjectForm.reset();

            resetLessonProjectFileState();

            showCourseMessage(
                "Tarea guardada correctamente."
            );

            refreshLessonLocks();

        } catch (error) {

            console.error(error);

            showCourseMessage(
                error.message ||
                "No se pudo guardar la tarea."
            );

        } finally {

            submitButton.disabled =
                false;

            submitButton.textContent =
                originalText;

        }

    }
);

/* INIT */

async function initCoursePlayer() {

    const canAccess =
        await validateCourseAccess();

    if (!canAccess) {

        return;

    }

    await loadCourse();

    await loadProgress();

    await loadModules();

    refreshLessonLocks();

    showWelcomeView();
    await loadFinalProjectStatus();
    updateFinishCourseButton();

    const openNotes =
        new URLSearchParams(window.location.search).get("openNotes") === "true";

    if (openNotes) {

        setTimeout(() => {
            toggleNotesPanel();
        }, 500);

    }

}

initCoursePlayer();
