
const user =
    JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "mentor") {
    window.location.href = "../login.html";
}

const mentorProjectsGrid =
    document.getElementById("mentorProjectsGrid");

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

async function loadMentorProjects() {

    const response =
        await fetch("http://localhost:3000/api/projects");

    const projects =
        await response.json();

    mentorProjectsGrid.innerHTML = "";

    if (projects.length === 0) {

        mentorProjectsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No hay proyectos enviados</h3>
                <p>Cuando un alumno suba un proyecto, aparecerá aquí.</p>
            </div>
        `;

        return;
    }

    projects.forEach(project => {

        mentorProjectsGrid.innerHTML += `

            <div class="project-card">

                <h3>${project.title}</h3>

                <p>${project.description || ""}</p>

                <div class="project-status ${project.status}">
                    ${project.status === "approved"
                ? "Aprobado"
                : project.status === "rejected"
                    ? "Rechazado"
                    : "Pendiente"
            }
                </div>

                <br>

                <a
                    href="${project.project_url}"
                    target="_blank"
                    class="project-link"
                >
                    Ver entrega
                </a>

                <button
                    class="review-btn"
                    onclick='openFeedbackModal(${JSON.stringify(project)})'
                >
                    Evaluar proyecto
                </button>

            </div>

        `;

    });

}

function openFeedbackModal(project) {

    currentProjectId =
        project.id;

    projectStatus.value =
        project.status || "pending";

    projectFeedback.value =
        project.feedback || "";

    feedbackModal.classList.add("active-modal");

}

closeFeedbackModal.addEventListener("click", () => {

    feedbackModal.classList.remove("active-modal");

});

feedbackForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    await fetch(
        `http://localhost:3000/api/projects/${currentProjectId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body:
                JSON.stringify({
                    status: projectStatus.value,
                    feedback: projectFeedback.value
                })
        }
    );

    feedbackModal.classList.remove("active-modal");

    loadMentorProjects();

});

loadMentorProjects();