/* ========================= */
/* GET COURSE ID */
/* ========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const courseId =
    params.get("id");

/* ========================= */
/* ELEMENTS */
/* ========================= */

const courseTitle =
    document.getElementById(
        "courseTitle"
    );

const modulesContainer =
    document.getElementById(
        "modulesContainer"
    );

const moduleModal =
    document.querySelector(
        ".module-modal"
    );

const openModuleModal =
    document.getElementById(
        "openModuleModal"
    );

const closeModuleModal =
    document.querySelector(
        ".close-module-modal"
    );

const moduleForm =
    document.getElementById(
        "moduleForm"
    );

const moduleTitle =
    document.getElementById(
        "moduleTitle"
    );

/* ========================= */
/* LOAD COURSE */
/* ========================= */

async function loadCourse() {

    const response =
        await fetch(

            `http://localhost:3000/api/courses`

        );

    const courses =
        await response.json();

    const course =
        courses.find(

            c => c.id === courseId

        );

    if (course) {

        courseTitle.textContent =
            course.title;

    }

}

/* ========================= */
/* LOAD MODULES */
/* ========================= */

async function loadModules() {

    const response = await fetch(
        `http://localhost:3000/api/modules/${courseId}`
    );

    const modules = await response.json();

    modulesContainer.innerHTML = "";

    modules.forEach((module, index) => {

        setTimeout(() => {
            loadLessons(module.id);
        }, 100);

        modulesContainer.innerHTML += `

            <div class="module-card">

                <div class="module-header">

                    <div>

                        <div class="module-title">
                            Módulo ${index + 1}
                        </div>

                        <p>
                            ${module.title}
                        </p>

                    </div>

                    <div class="module-header-actions">

                        <button
                            class="edit-module-btn"
                            onclick="
                                editModule(
                                    '${module.id}',
                                    '${module.title}'
                                )
                            "
                        >
                            Editar
                        </button>

                        <button
                            class="delete-module-btn"

                            onclick="
                                deleteModule(
                                    '${module.id}'
                                )
                            "
                        >

                            Eliminar

                        </button>

                        <div class="module-toggle">
                            ▶
                        </div>

                    </div>

                </div>

                <div class="module-content">

                    <div
                        class="lessons-container"
                        id="lessons-${module.id}"
                    >
                    </div>

                    <button
                        class="add-lesson-btn"
                        onclick="openLessonModal('${module.id}')"
                    >
                        + Agregar clase
                    </button>

                </div>

            </div>

        `;

    });

    initModuleToggle();

}

/* ========================= */
/* TOGGLE */
/* ========================= */

function initModuleToggle() {

    const moduleCards =
        document.querySelectorAll(
            ".module-card"
        );

    moduleCards.forEach(card => {

        const header =
            card.querySelector(
                ".module-header"
            );

        header.addEventListener(
            "click",
            () => {

                card.classList.toggle(
                    "active"
                );

            }
        );

    });

}

/* ========================= */
/* OPEN MODAL */
/* ========================= */

openModuleModal.addEventListener(
    "click",
    () => {

        moduleModal.classList.add(
            "active-modal"
        );

    }
);

/* ========================= */
/* CLOSE MODAL */
/* ========================= */

closeModuleModal.addEventListener(
    "click",
    () => {

        moduleModal.classList.remove(
            "active-modal"
        );

    }
);

/* ========================= */
/* CREATE MODULE */
/* ========================= */

moduleForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const moduleData = {

            course_id:
                courseId,

            title:
                moduleTitle.value,

        };

        await fetch(

            "http://localhost:3000/api/modules",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        moduleData
                    )

            }

        );

        moduleForm.reset();

        moduleModal.classList.remove(
            "active-modal"
        );

        loadModules();

    }
);

/* ========================= */
/* INIT */
/* ========================= */

loadCourse();

loadModules();

/* ========================= */
/* LOAD LESSONS */
/* ========================= */

async function loadLessons(moduleId) {

    const response = await fetch(
        `http://localhost:3000/api/lessons/${moduleId}`
    );

    const lessons = await response.json();

    const lessonsContainer = document.getElementById(
        `lessons-${moduleId}`
    );

    lessonsContainer.innerHTML = "";

    lessons.forEach((lesson, index) => {

        lessonsContainer.innerHTML += `

            <div class="lesson-item">

                <div>

                    <strong>

                        ${index + 1}.0
                        ${lesson.title}

                    </strong>

                    <div class="lesson-meta">

                        ${lesson.is_preview
                ? `
                                <span class="preview-badge">

                                    Preview

                                </span>
                            `
                : ""
            }

                    </div>

                </div>

                <div class="lesson-actions">

                    <a
                        href="${lesson.video_url}"
                        target="_blank"
                        class="video-btn"
                    >

                        ▶ Ver video

                    </a>

                    <span>

                        ${lesson.duration}

                    </span>

                    <button
                        class="edit-lesson-btn"
                        onclick='
                            editLesson(
                                ${JSON.stringify(lesson)}
                            )
                        '
                    >

                        ✎

                    </button>

                    <button
                        class="delete-lesson-btn"
                        onclick="
                            deleteLesson(
                                '${lesson.id}',
                                '${moduleId}'
                            )
                        "
                    >

                        ✕

                    </button>

                </div>

                <button

                    class="resource-btn"

                    onclick="
                        openResourceModal(
                            '${lesson.id}'
                        )
                    "
                >

                    + Recurso

                </button>

                <div
                    class="resources-list"
                    id="resources-${lesson.id}"
                >

                </div>

            </div>

        `;

        loadResources(
            lesson.id
        );

    });

}

/* ========================= */
/* LESSON MODAL */
/* ========================= */

const lessonModal =
    document.querySelector(
        ".lesson-modal"
    );

const closeLessonModal =
    document.querySelector(
        ".close-lesson-modal"
    );

const lessonForm =
    document.getElementById(
        "lessonForm"
    );

const lessonTitle =
    document.getElementById(
        "lessonTitle"
    );

const lessonDuration =
    document.getElementById(
        "lessonDuration"
    );

const lessonVideo =
    document.getElementById(
        "lessonVideo"
    );

const lessonPreview =
    document.getElementById(
        "lessonPreview"
    );

/* ACTIVE MODULE */

let activeModuleId =
    null;

/* OPEN LESSON MODAL */

function openLessonModal(moduleId) {

    activeModuleId =
        moduleId;

    lessonModal.classList.add(
        "active-modal"
    );

}

/* CLOSE LESSON MODAL */

closeLessonModal.addEventListener(
    "click",
    () => {

        lessonModal.classList.remove(
            "active-modal"
        );

    }
);

/* CREATE LESSON */

lessonForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const lessonData = {

            module_id:
                activeModuleId,

            title:
                lessonTitle.value,

            duration:
                lessonDuration.value,

            position:
                1,

            video_url:
                lessonVideo.value,

            is_preview:
                lessonPreview.checked

        };

        await fetch(

            "http://localhost:3000/api/lessons",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        lessonData
                    )

            }

        );

        lessonForm.reset();

        lessonModal.classList.remove(
            "active-modal"
        );

        loadLessons(
            activeModuleId
        );

    }
);

/* ========================= */
/* DELETE LESSON */
/* ========================= */

async function deleteLesson(

    lessonId,
    moduleId

) {

    const confirmDelete =
        confirm(

            "¿Eliminar clase?"

        );

    if (!confirmDelete) return;

    await fetch(

        `http://localhost:3000/api/lessons/${lessonId}`,

        {

            method: "DELETE"

        }

    );

    loadLessons(
        moduleId
    );

}

/* ========================= */
/* EDIT MODULE MODAL */
/* ========================= */

const editModuleModal =
    document.querySelector(
        ".edit-module-modal"
    );

const closeEditModule =
    document.querySelector(
        ".close-edit-module"
    );

const editModuleForm =
    document.getElementById(
        "editModuleForm"
    );

const editModuleTitle =
    document.getElementById(
        "editModuleTitle"
    );

let currentModuleId =
    null;

/* OPEN */

function editModule(

    moduleId,
    currentTitle

) {

    currentModuleId =
        moduleId;

    editModuleTitle.value =
        currentTitle;

    editModuleModal.classList.add(
        "active-modal"
    );

}

/* CLOSE */

closeEditModule.addEventListener(
    "click",
    () => {

        editModuleModal.classList.remove(
            "active-modal"
        );

    }
);

/* SAVE */

editModuleForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        await fetch(

            `http://localhost:3000/api/modules/${currentModuleId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        title:
                            editModuleTitle.value

                    })

            }

        );

        editModuleModal.classList.remove(
            "active-modal"
        );

        loadModules();

    }
);

/* ========================= */
/* DELETE MODULE MODAL */
/* ========================= */

const deleteModuleModal =
    document.querySelector(
        ".delete-module-modal"
    );

const cancelDeleteModule =
    document.querySelector(
        ".cancel-delete-module"
    );

const confirmDeleteModule =
    document.querySelector(
        ".confirm-delete-module"
    );

let currentDeleteModuleId =
    null;

/* OPEN */

function deleteModule(

    moduleId

) {

    currentDeleteModuleId =
        moduleId;

    deleteModuleModal.classList.add(
        "active-modal"
    );

}

/* CANCEL */

cancelDeleteModule.addEventListener(
    "click",
    () => {

        deleteModuleModal.classList.remove(
            "active-modal"
        );

    }
);

/* CONFIRM */

confirmDeleteModule.addEventListener(
    "click",
    async () => {

        await fetch(

            `http://localhost:3000/api/modules/${currentDeleteModuleId}`,

            {

                method: "DELETE"

            }

        );

        deleteModuleModal.classList.remove(
            "active-modal"
        );

        loadModules();

    }
);

/* ========================= */
/* EDIT LESSON MODAL */
/* ========================= */

const editLessonModal =
    document.querySelector(
        ".edit-lesson-modal"
    );

const closeEditLesson =
    document.querySelector(
        ".close-edit-lesson"
    );

const editLessonForm =
    document.getElementById(
        "editLessonForm"
    );

const editLessonTitle =
    document.getElementById(
        "editLessonTitle"
    );

const editLessonDuration =
    document.getElementById(
        "editLessonDuration"
    );

const editLessonVideo =
    document.getElementById(
        "editLessonVideo"
    );

const editLessonPreview =
    document.getElementById(
        "editLessonPreview"
    );

let currentLesson =
    null;

/* OPEN EDIT MODAL */

function editLesson(

    lesson

) {

    currentLesson =
        lesson;

    editLessonTitle.value =
        lesson.title;

    editLessonDuration.value =
        lesson.duration;

    editLessonVideo.value =
        lesson.video_url;

    editLessonPreview.checked =
        lesson.is_preview;

    editLessonModal.classList.add(
        "active-modal"
    );

}

/* CLOSE */

closeEditLesson.addEventListener(
    "click",
    () => {

        editLessonModal.classList.remove(
            "active-modal"
        );

    }
);

/* SAVE */

editLessonForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        await fetch(

            `http://localhost:3000/api/lessons/${currentLesson.id}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        title:
                            editLessonTitle.value,

                        duration:
                            editLessonDuration.value,

                        video_url:
                            editLessonVideo.value,

                        is_preview:
                            editLessonPreview.checked

                    })

            }

        );

        editLessonModal.classList.remove(
            "active-modal"
        );

        loadLessons(
            currentLesson.module_id
        );

    }
);

/* ========================= */
/* RESOURCE MODAL */
/* ========================= */

const resourceModal =
    document.querySelector(
        ".resource-modal"
    );

const closeResourceModal =
    document.querySelector(
        ".close-resource-modal"
    );

const resourceForm =
    document.getElementById(
        "resourceForm"
    );

const resourceTitle =
    document.getElementById(
        "resourceTitle"
    );

const resourceUrl =
    document.getElementById(
        "resourceUrl"
    );

const resourceType =
    document.getElementById(
        "resourceType"
    );

let currentLessonResource =
    null;

/* OPEN */

function openResourceModal(

    lessonId

) {

    currentLessonResource =
        lessonId;

    resourceModal.classList.add(
        "active-modal"
    );

}

/* CLOSE */

closeResourceModal.addEventListener(
    "click",
    () => {

        resourceModal.classList.remove(
            "active-modal"
        );

    }
);

/* SAVE */

resourceForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        await fetch(

            "http://localhost:3000/api/resources",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        lesson_id:
                            currentLessonResource,

                        title:
                            resourceTitle.value,

                        file_url:
                            resourceUrl.value,

                        file_type:
                            resourceType.value

                    })

            }

        );

        resourceModal.classList.remove(
            "active-modal"
        );

        loadResources(
            currentLessonResource
        );

    }
);

/* ========================= */
/* LOAD RESOURCES */
/* ========================= */

async function loadResources(

    lessonId

) {

    const response =
        await fetch(

            `http://localhost:3000/api/resources/${lessonId}`

        );

    const resources =
        await response.json();

    const container =
        document.getElementById(

            `resources-${lessonId}`

        );

    container.innerHTML = "";

    resources.forEach(

        (resource) => {

            let icon = "📄";

            if (
                resource.file_type === "zip"
            ) {

                icon = "📦";

            }

            if (
                resource.file_type === "ppt"
            ) {

                icon = "📘";

            }

            container.innerHTML += `

                <div class="resource-item">

                    <div class="resource-left">

                        <div class="resource-icon">

                            ${icon}

                        </div>

                        <div class="resource-title">

                            ${resource.title}

                        </div>

                    </div>

                    <div class="resource-actions">

                        <button

                            class="open-resource-btn"

                            onclick="
                                window.open(
                                    '${resource.file_url}'
                                )
                            "
                        >

                            Abrir

                        </button>

                        <button

                            class="delete-resource-btn"

                            onclick="
                                deleteResource(
                                    '${resource.id}',
                                    '${lessonId}'
                                )
                            "
                        >

                            Eliminar

                        </button>

                    </div>

                </div>

            `;

        }

    );

}

/* ========================= */
/* DELETE RESOURCE */
/* ========================= */

async function deleteResource(

    resourceId,
    lessonId

) {

    await fetch(

        `http://localhost:3000/api/resources/${resourceId}`,

        {

            method: "DELETE"

        }

    );

    loadResources(
        lessonId
    );

}