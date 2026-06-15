
function escapeHtml(text) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

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

function getSubmissionTypeLabel(project) {

    return project.submission_type === "final_project"
        ? "Proyecto Final"
        : "Tarea";

}

function getSubmissionTypeClass(project) {

    return project.submission_type === "final_project"
        ? "final-project-type"
        : "task-type";

}

async function loadMentorProjects() {

    const response =
        await fetch(
            `${API_URL}/api/projects/mentor/${user.id}`
        );

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

    const grouped = {};
    projects.forEach(p => {
        const key = p.user_id || "unknown";
        if (!grouped[key]) grouped[key] = { user_name: p.user_name || "Desconocido", projects: [] };
        grouped[key].projects.push(p);
    });

    Object.values(grouped).forEach((group, i) => {

        mentorProjectsGrid.innerHTML += `
            <div class="student-group">
                <div class="student-group-header" onclick="toggleStudentProjects(${i})">
                    <span class="collapse-arrow">▶</span>
                    <h2>${escapeHtml(group.user_name)}</h2>
                    <span class="project-count">${group.projects.length} entrega${group.projects.length !== 1 ? "s" : ""}</span>
                </div>
                <div class="student-projects-grid" id="studentProjects${i}">
                    ${group.projects.map(project => `

                        <div class="project-card">

                            <span class="submission-type ${getSubmissionTypeClass(project)}">
                                ${getSubmissionTypeLabel(project)}
                            </span>

                            <h3>${escapeHtml(project.title)}</h3>

                            <p class="course-name">${escapeHtml(project.course_title || "")}</p>

                            <p>${escapeHtml(project.description || "")}</p>

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
                                href="${escapeHtml(project.project_url)}"
                                target="_blank"
                                class="project-link"
                            >
                                Ver entrega
                            </a>

                            ${project.status !== "approved" ? `
                                <button
                                    class="review-btn"
                                    onclick='openFeedbackModal(${JSON.stringify(project).replace(/'/g, "&#39;")})'
                                >
                                    Evaluar proyecto
                                </button>
                            ` : ""}

                        </div>

                    `).join("")}
                </div>
            </div>
        `;

        // collapse by default
        document.getElementById("studentProjects" + i).classList.add("collapsed");
        document.querySelectorAll(".student-group-header")[i].classList.add("collapsed");

    });

}

function toggleStudentProjects(index) {

    const grid = document.getElementById("studentProjects" + index);
    const header = document.querySelectorAll(".student-group-header")[index];
    grid.classList.toggle("collapsed");
    header.classList.toggle("collapsed");

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
        `${API_URL}/api/projects/${currentProjectId}`,
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
