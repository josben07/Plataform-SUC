
const adminToast =
    document.querySelector(".admin-toast");

const adminToastMessage =
    document.getElementById("adminToastMessage");

function showAdminToast(message) {

    adminToastMessage.textContent =
        message;

    adminToast.classList.add(
        "show-toast"
    );

    setTimeout(() => {

        adminToast.classList.remove(
            "show-toast"
        );

    }, 3000);

}

const searchProject =
    document.getElementById(
        "searchProject"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );

let currentFilter =
    "all";

const projectsGrid =
    document.getElementById(
        "projectsGrid"
    );

/* LOAD PROJECTS */

async function loadProjects() {

    const response =
        await fetch(

            `${API_URL}/api/projects`

        );

    let projects =
        await response.json();

    /* FILTER STATUS */

    if (currentFilter !== "all") {

        projects =
            projects.filter(

                (project) =>

                    project.status ===
                    currentFilter

            );

    }

    /* SEARCH */

    const searchValue =
        searchProject.value
            .toLowerCase();

    projects =
        projects.filter(

            (project) =>

                project.title
                    .toLowerCase()
                    .includes(searchValue)

        );

    projectsGrid.innerHTML = "";

    /* EMPTY STATE */

    if (projects.length === 0) {

        projectsGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    🚀

                </div>

                <h3>

                    No hay proyectos

                </h3>

                <p>

                    Aún no existen proyectos enviados.

                </p>

            </div>

        `;

        return;

    }

    projects.forEach(

        (project) => {

            projectsGrid.innerHTML += `

                <div class="project-card">

                    <h3>

                        ${project.title}

                    </h3>

                    <p>

                        ${project.description || ""}

                    </p>

                    <div class="
                        project-status
                        ${project.status}
                    ">

                        ${project.status}

                    </div>

                    <div class="project-actions">

                        <button

                            class="review-btn"

                            onclick='openFeedbackModal(
                                ${JSON.stringify(project)}
                            )'

                        >

                            Evaluar

                        </button>

                    </div>

                </div>

            `;

        }

    );

}

/* SEARCH */

searchProject.addEventListener(

    "input",

    loadProjects

);

/* FILTERS */

filterButtons.forEach(

    (button) => {

        button.addEventListener(

            "click",

            () => {

                filterButtons.forEach(

                    (btn) => {

                        btn.classList.remove(
                            "active-filter"
                        );

                    }

                );

                button.classList.add(
                    "active-filter"
                );

                currentFilter =
                    button.dataset.status;

                loadProjects();

            }

        );

    }

);

/* UPDATE STATUS */

async function updateStatus(

    projectId,
    status

) {

    await fetch(

        `${API_URL}/api/projects/${projectId}`,

        {

            method: "PUT",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify({

                    status

                })

        }

    );

    loadProjects();

}

loadProjects();

const feedbackModal =
    document.querySelector(".feedback-modal");

const closeFeedbackModal =
    document.querySelector(".close-feedback-modal");

const feedbackForm =
    document.getElementById("feedbackForm");

const projectStatus =
    document.getElementById("projectStatus");

const projectFeedback =
    document.getElementById("projectFeedback");

let currentProjectId =
    null;

function openFeedbackModal(project) {

    currentProjectId =
        project.id;

    projectStatus.value =
        project.status || "pending";

    projectFeedback.value =
        project.feedback || "";

    feedbackModal.classList.add(
        "active-feedback-modal"
    );

}

closeFeedbackModal.addEventListener(

    "click",

    () => {

        feedbackModal.classList.remove(
            "active-feedback-modal"
        );

    }

);

feedbackForm.addEventListener(

    "submit",

    async (e) => {

        e.preventDefault();

        await fetch(

            `${API_URL}/api/projects/${currentProjectId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        status:
                            projectStatus.value,

                        feedback:
                            projectFeedback.value

                    })

            }

        );

        feedbackModal.classList.remove(
            "active-feedback-modal"
        );

        loadProjects();

    }

);