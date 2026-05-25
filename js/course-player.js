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

let currentLessonId =
    null;

let completedLessons =
    [];

/* LOAD COURSE */

async function loadCourse() {

    const response =
        await fetch("http://localhost:3000/api/courses");

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
            `http://localhost:3000/api/modules/${courseId}`
        );

    const modules =
        await response.json();

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
            `http://localhost:3000/api/lessons/${moduleId}`
        );

    const lessons =
        await response.json();

    const container =
        document.getElementById(`lessons-${moduleId}`);

    lessons.forEach((lesson, index) => {

        container.innerHTML += `

            <button
                class="player-lesson"
                onclick='openLesson(${JSON.stringify(lesson)})'
            >
                ${moduleIndex + 1}.${index}
                ${lesson.title}
            </button>

        `;

    });

}

/* OPEN LESSON */

async function openLesson(lesson) {

    currentLessonId =
        lesson.id;

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

        videoBox.innerHTML = `
            <a
                href="${lesson.video_url}"
                target="_blank"
                style="color:white;text-decoration:none;"
            >
                ▶ Ver video
            </a>
        `;

    } else {

        videoBox.textContent =
            "Sin video";

    }

    loadResources(lesson.id);

}

/* LOAD RESOURCES */

async function loadResources(lessonId) {

    const response =
        await fetch(
            `http://localhost:3000/api/resources/${lessonId}`
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
            `http://localhost:3000/api/progress/${user.id}/${courseId}`
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
            "http://localhost:3000/api/progress/complete",
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

/* INIT */

loadCourse();

loadProgress();

loadModules();