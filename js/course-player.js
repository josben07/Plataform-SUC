const lessonProjectForm =
    document.getElementById("lessonProjectForm");

const lessonProjectTitle =
    document.getElementById("lessonProjectTitle");

const lessonProjectDescription =
    document.getElementById("lessonProjectDescription");

const lessonProjectUrl =
    document.getElementById("lessonProjectUrl");

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

let allModulesData =
    [];

let allLessonsData =
    [];

let currentLessonId =
    null;

let completedLessons =
    [];
let unlockedLessonIds =
    [];
let currentCourseRelation =
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

function updateFinishCourseButton() {

    if (!finishCourseBtn) {

        return;

    }

    const canFinishCourse =
        getCurrentProgressPercent() === 100 &&
        currentCourseRelation &&
        currentCourseRelation.status !== "Completed";

    finishCourseBtn.classList.toggle(
        "visible-finish-btn",
        canFinishCourse
    );

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

    modulesList.innerHTML = "";

    modules.forEach((module, index) => {

        modulesList.innerHTML += `

            <div class="player-module">

                <div class="player-module-header">
                    Módulo ${index + 1}: ${module.title}
                </div>

                <div
                    class="player-lessons"
                    id="lessons-${module.id}"
                ></div>

            </div>

        `;

        loadLessons(module.id, index);

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

    allLessonsData =
        [
            ...allLessonsData,
            ...lessons
        ];

    const container =
        document.getElementById(`lessons-${moduleId}`);

    lessons.forEach((lesson, index) => {

        container.innerHTML += `

<button
    class="player-lesson"
    id="lesson-${lesson.id}"
    data-lesson-id="${lesson.id}"
    onclick='handleLessonClick(${JSON.stringify(lesson)})'
>
        <span>
            ${moduleIndex + 1}.${index}
        </span>

        ${lesson.title}
    </button>

`;

    });

}

async function validateLessonRequirements() {

    const mentorsResponse =
        await fetch(
            `${API_URL}/api/student-mentors/${user.id}`
        );

    const mentors =
        await mentorsResponse.json();

    const hasMentor =
        mentors.some(
            item => item.course_id === courseId
        );

    if (!hasMentor) {

        showCourseMessage(
            "Debes seleccionar un mentor antes de completar esta clase."
        );

        return false;

    }

    const paymentsResponse =
        await fetch(
            `${API_URL}/api/payments`
        );

    const payments =
        await paymentsResponse.json();

    const hasApprovedPayment =
        payments.some(payment =>
            payment.student_id === user.id &&
            payment.course_id === courseId &&
            payment.status === "aprobado"
        );

    if (!hasApprovedPayment) {

        showCourseMessage(
            "Debes realizar el pago antes de completar esta clase."
        );

        return false;

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
            project.lesson_id === currentLessonId
        );

    if (!lessonProject) {

        showCourseMessage(
            "Debes subir el entregable de esta clase antes de completarla."
        );

        return false;

    }

    if (lessonProject.status === "pending") {

        showCourseMessage(
            "Tu entregable está pendiente de revisión por el mentor."
        );

        return false;

    }

    if (lessonProject.status === "rejected") {

        showCourseMessage(
            "Tu entregable fue rechazado. Revisa el feedback y vuelve a enviarlo."
        );

        return false;

    }

    if (lessonProject.status !== "approved") {

        showCourseMessage(
            "Tu entregable está pendiente de revisión por el mentor."
        );

        return false;

    }

    return true;

}

/* OPEN LESSON */

async function openLesson(lesson) {

    currentLessonId =
        lesson.id;

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

}

/* LOAD RESOURCES */

async function loadResources(lessonId) {

    const response =
        await fetch(
            `${API_URL}/api/resources/${lessonId}`
        );

    const resources =
        await response.json();

    lessonResources.innerHTML = "";

    if (resources.length === 0) {

        lessonResources.innerHTML =
            "<p style='color:rgba(255,255,255,0.6);margin-top:14px;'>Esta clase aún no tiene recursos.</p>";

        return;

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

}

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

    lessonTitle.textContent =
        "Bienvenido al curso";

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

    const totalLessons =
        new Set(
            allLessonsData.map(lesson => lesson.id)
        ).size;

    const progressPercent =
        getCurrentProgressPercent();

    updateFinishCourseButton();

    videoBox.innerHTML = `

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

    if (resourcesPanel) {
        resourcesPanel.style.display =
            "block";
    }

    if (lessonProjectPanel) {
        lessonProjectPanel.style.display =
            "block";
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

            showCourseMessage(
                "Curso finalizado correctamente."
            );

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

    calculateUnlockedLessons();

    document
        .querySelectorAll(".player-lesson")
        .forEach(button => {

            const lessonId =
                button.dataset.lessonId;

            const isUnlocked =
                unlockedLessonIds.includes(
                    lessonId
                );

            button.classList.toggle(
                "locked-lesson",
                !isUnlocked
            );

            const existingLock =
                button.querySelector(".lesson-lock");

            if (existingLock) {

                existingLock.remove();

            }

            if (!isUnlocked) {

                button.innerHTML += `
        <small class="lesson-lock">
            🔒
        </small>
    `;

            }

        });

}

function handleLessonClick(lesson) {

    const isUnlocked =
        unlockedLessonIds.includes(
            lesson.id
        );

    if (!isUnlocked) {

        showCourseMessage(
            "Esta clase está bloqueada. Completa la clase anterior para desbloquearla."
        );

        return;

    }

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

lessonProjectForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        if (!currentLessonId) {

            showCourseMessage(
                "Selecciona una clase antes de enviar un entregable."
            );

            return;

        }

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
                            lessonProjectUrl.value,

                        status:
                            "pending"

                    })
            }
        );

        lessonProjectForm.reset();

        showCourseMessage(
            "Entregable enviado correctamente."
        );
        
        refreshLessonLocks();

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

    setTimeout(() => {

        refreshLessonLocks();

        showWelcomeView();
        updateFinishCourseButton();

    }, 500);

}

initCoursePlayer();
