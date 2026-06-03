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

const resourcesPanel =
    document.querySelector(".resources-panel");

const commentsPanel =
    document.querySelector(".comments-panel");

let allModulesData =
    [];

let allLessonsData =
    [];

let currentLessonId =
    null;

let completedLessons =
    [];

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
        onclick='openLesson(${JSON.stringify(lesson)})'
    >
        <span>
            ${moduleIndex + 1}.${index}
        </span>

        ${lesson.title}
    </button>

`;

    });

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

}

completeLessonBtn.addEventListener(
    "click",
    async () => {

        if (!currentLessonId) {

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

    const completedCount =
        completedLessons.filter(
            item => item.completed === true
        ).length;

    const totalLessons =
        allLessonsData.length;

    const progressPercent =
        totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

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

    if (commentsPanel) {
        commentsPanel.style.display =
            "block";
    }

}

function startFirstLesson() {

    if (allLessonsData.length === 0) {

        return;

    }

    openLesson(
        allLessonsData[0]
    );

}

/* INIT */

async function initCoursePlayer() {

    await loadCourse();

    await loadProgress();

    await loadModules();

    setTimeout(() => {

        showWelcomeView();

    }, 500);

}

initCoursePlayer();