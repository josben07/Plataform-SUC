const adminToast =
    document.querySelector(".admin-toast");

const adminToastMessage =
    document.getElementById("adminToastMessage");

const searchProject =
    document.getElementById("searchProject");

const typeFilterButtons =
    document.querySelectorAll(".type-filter");

const statusFilterButtons =
    document.querySelectorAll(".status-filter");

const projectsGrid =
    document.getElementById("projectsGrid");

const deliveryModal =
    document.querySelector(".delivery-modal");

const closeDeliveryModal =
    document.querySelector(".close-delivery-modal");

const deliveryModalTitle =
    document.getElementById("deliveryModalTitle");

const deliveryDetailGrid =
    document.getElementById("deliveryDetailGrid");

const deliveryFeedbackBox =
    document.getElementById("deliveryFeedbackBox");

const deliveryLinkBtn =
    document.getElementById("deliveryLinkBtn");

let currentStatusFilter =
    "all";

let currentTypeFilter =
    "all";

let allProjects =
    [];

const openStudentGroups =
    new Set();

function showAdminToast(message) {

    if (!adminToast || !adminToastMessage) {

        alert(message);
        return;

    }

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

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.appendChild(
        document.createTextNode(
            value == null
                ? ""
                : String(value)
        )
    );

    return div.innerHTML;

}

function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}

function getSubmissionTypeLabel(project) {

    return project.submission_type === "final_project"
        ? "Proyecto final"
        : "Tarea";

}

function getSubmissionTypeClass(project) {

    return project.submission_type === "final_project"
        ? "final-project-type"
        : "task-type";

}

function getStatusLabel(status) {

    if (status === "approved") {

        return "Aprobado";

    }

    if (status === "rejected") {

        return "Rechazado";

    }

    return "Pendiente";

}

function formatDate(dateValue) {

    if (!dateValue) {

        return "Sin fecha";

    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {

        return "Sin fecha";

    }

    return date.toLocaleDateString(
        "es-PE",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}

function getSafeUrl(url) {

    if (!url) {

        return "";

    }

    try {

        const parsedUrl =
            new URL(
                url,
                window.location.origin
            );

        if (
            parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
        ) {

            return parsedUrl.href;

        }

    } catch (error) {

        return "";

    }

    return "";

}

function getSearchHaystack(project) {

    return normalizeText([
        project.title,
        project.description,
        project.user_name,
        project.course_title,
        project.lesson_title,
        project.task_title,
        project.mentor_name,
        getSubmissionTypeLabel(project),
        getStatusLabel(project.status)
    ].join(" "));

}

function getFilteredProjects() {

    const searchValue =
        normalizeText(
            searchProject ? searchProject.value : ""
        );

    return allProjects.filter(project => {

        const matchesType =
            currentTypeFilter === "all" ||
            project.submission_type === currentTypeFilter;

        const matchesStatus =
            currentStatusFilter === "all" ||
            project.status === currentStatusFilter;

        const matchesSearch =
            !searchValue ||
            getSearchHaystack(project).includes(searchValue);

        return matchesType &&
            matchesStatus &&
            matchesSearch;

    });

}

function getGroupedByStudent(projects) {

    const groups =
        new Map();

    projects.forEach(project => {

        const key =
            project.user_id ||
            project.user_name ||
            "unknown";

        if (!groups.has(key)) {

            groups.set(
                key,
                {
                    key,
                    user_name:
                        project.user_name ||
                        "Alumno desconocido",
                    projects:
                        []
                }
            );

        }

        groups.get(key).projects.push(project);

    });

    return Array.from(
        groups.values()
    );

}

function getStudentGroupStats(projects) {

    return {
        total:
            projects.length,
        pending:
            projects.filter(project => project.status === "pending").length,
        approved:
            projects.filter(project => project.status === "approved").length,
        rejected:
            projects.filter(project => project.status === "rejected").length,
        tasks:
            projects.filter(project => project.submission_type !== "final_project").length,
        finalProjects:
            projects.filter(project => project.submission_type === "final_project").length
    };

}

function renderSummary(projects) {

    const pendingCount =
        projects.filter(project => project.status === "pending").length;

    const taskCount =
        projects.filter(project => project.submission_type !== "final_project").length;

    const finalProjectCount =
        projects.filter(project => project.submission_type === "final_project").length;

    return `
        <div class="deliveries-summary">
            <div>
                <span>Total</span>
                <strong>${projects.length}</strong>
            </div>
            <div>
                <span>Pendientes</span>
                <strong>${pendingCount}</strong>
            </div>
            <div>
                <span>Tareas</span>
                <strong>${taskCount}</strong>
            </div>
            <div>
                <span>Proyectos finales</span>
                <strong>${finalProjectCount}</strong>
            </div>
        </div>
    `;

}

function renderProjectCard(project) {

    const safeUrl =
        getSafeUrl(project.project_url);

    const lessonText =
        project.lesson_title ||
        project.task_title ||
        "Sin lección asociada";

    return `
        <article class="project-card">
            <div class="project-card-top">
                <span class="submission-type ${getSubmissionTypeClass(project)}">
                    ${getSubmissionTypeLabel(project)}
                </span>
                <span class="project-status ${project.status || "pending"}">
                    ${getStatusLabel(project.status)}
                </span>
            </div>

            <h3>${escapeHtml(project.title || "Entrega sin título")}</h3>

            <p class="project-description">
                ${escapeHtml(project.description || "Sin descripción.")}
            </p>

            <div class="project-meta">
                <p><span>Curso</span>${escapeHtml(project.course_title || "Curso desconocido")}</p>
                <p><span>Lección</span>${escapeHtml(lessonText)}</p>
                <p><span>Mentor</span>${escapeHtml(project.mentor_name || "Sin mentor asignado")}</p>
                <p><span>Fecha</span>${escapeHtml(formatDate(project.created_at))}</p>
            </div>

            <div class="project-actions">
                <button
                    class="review-btn"
                    onclick="openDeliveryModal('${escapeHtml(project.id)}')"
                >
                    Ver detalle
                </button>

                ${safeUrl
                    ? `
                        <a
                            href="${escapeHtml(safeUrl)}"
                            target="_blank"
                            class="project-link-btn"
                        >
                            Abrir entrega
                        </a>
                    `
                    : ""
                }
            </div>
        </article>
    `;

}

function renderProjects() {

    const filteredProjects =
        getFilteredProjects();

    projectsGrid.innerHTML =
        renderSummary(filteredProjects);

    if (filteredProjects.length === 0) {

        projectsGrid.innerHTML += `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <h3>No hay entregas</h3>
                <p>No se encontraron tareas o proyectos con los filtros actuales.</p>
            </div>
        `;

        return;

    }

    const groups =
        getGroupedByStudent(filteredProjects);

    projectsGrid.innerHTML += groups
        .map(renderStudentGroup)
        .join("");

    bindStudentGroupToggles();

}

function renderStudentGroup(group) {

    const stats =
        getStudentGroupStats(
            group.projects
        );

    const isOpen =
        openStudentGroups.has(group.key);

    return `
        <section class="student-delivery-group ${isOpen ? "open-group" : ""}">
            <div class="student-delivery-header">
                <div class="student-delivery-main">
                    <span>Alumno</span>
                    <h3>${escapeHtml(group.user_name)}</h3>
                </div>

                <div class="student-delivery-counts">
                    <span>${stats.total} entrega${stats.total !== 1 ? "s" : ""}</span>
                    <span>${stats.pending} pendiente${stats.pending !== 1 ? "s" : ""}</span>
                    <span>${stats.approved} aprobada${stats.approved !== 1 ? "s" : ""}</span>
                    <span>${stats.rejected} rechazada${stats.rejected !== 1 ? "s" : ""}</span>
                </div>

                <button
                    type="button"
                    class="toggle-deliveries-btn"
                    data-student-key="${escapeHtml(group.key)}"
                    aria-expanded="${isOpen ? "true" : "false"}"
                >
                    ${isOpen ? "Ocultar" : "Ver entregas"}
                </button>
            </div>

            <div class="student-delivery-breakdown">
                <span>${stats.tasks} tarea${stats.tasks !== 1 ? "s" : ""}</span>
                <span>${stats.finalProjects} proyecto${stats.finalProjects !== 1 ? "s" : ""} final${stats.finalProjects !== 1 ? "es" : ""}</span>
            </div>

            ${isOpen
                ? `
                    <div class="student-delivery-list">
                        ${group.projects.map(renderProjectCard).join("")}
                    </div>
                `
                : ""
            }
        </section>
    `;

}

function bindStudentGroupToggles() {

    document
        .querySelectorAll(".toggle-deliveries-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const key =
                    button.dataset.studentKey;

                if (!key) {

                    return;

                }

                if (openStudentGroups.has(key)) {

                    openStudentGroups.delete(key);

                } else {

                    openStudentGroups.add(key);

                }

                renderProjects();

            });

        });

}

async function loadProjects() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/projects`
            );

        const projects =
            await response.json();

        if (!response.ok) {

            throw new Error(
                projects.error ||
                "No se pudieron cargar las entregas."
            );

        }

        allProjects =
            Array.isArray(projects)
                ? projects
                : [];

        renderProjects();

    } catch (error) {

        console.error(error);

        showAdminToast(
            error.message ||
            "No se pudieron cargar las entregas."
        );

        projectsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No se pudieron cargar las entregas</h3>
                <p>Intenta nuevamente en unos segundos.</p>
            </div>
        `;

    }

}

function setActiveFilter(buttons, activeButton) {

    buttons.forEach(button => {

        button.classList.toggle(
            "active-filter",
            button === activeButton
        );

    });

}

function openDeliveryModal(projectId) {

    const project =
        allProjects.find(item => item.id === projectId);

    if (!project) {

        showAdminToast(
            "No se encontró la entrega."
        );

        return;

    }

    const safeUrl =
        getSafeUrl(project.project_url);

    const lessonText =
        project.lesson_title ||
        project.task_title ||
        "Sin lección asociada";

    deliveryModalTitle.textContent =
        project.title ||
        "Detalle de entrega";

    deliveryDetailGrid.innerHTML = `
        <div>
            <span>Alumno</span>
            <strong>${escapeHtml(project.user_name || "Alumno desconocido")}</strong>
        </div>
        <div>
            <span>Curso</span>
            <strong>${escapeHtml(project.course_title || "Curso desconocido")}</strong>
        </div>
        <div>
            <span>Tipo</span>
            <strong>${getSubmissionTypeLabel(project)}</strong>
        </div>
        <div>
            <span>Estado</span>
            <strong>${getStatusLabel(project.status)}</strong>
        </div>
        <div>
            <span>Lección</span>
            <strong>${escapeHtml(lessonText)}</strong>
        </div>
        <div>
            <span>Mentor</span>
            <strong>${escapeHtml(project.mentor_name || "Sin mentor asignado")}</strong>
        </div>
        <div>
            <span>Fecha de envío</span>
            <strong>${escapeHtml(formatDate(project.created_at))}</strong>
        </div>
        <div>
            <span>Descripción</span>
            <strong>${escapeHtml(project.description || "Sin descripción.")}</strong>
        </div>
    `;

    deliveryFeedbackBox.innerHTML = `
        <span>Feedback del mentor</span>
        <p>${escapeHtml(project.feedback || "Sin feedback registrado.")}</p>
    `;

    if (safeUrl) {

        deliveryLinkBtn.href =
            safeUrl;

        deliveryLinkBtn.style.display =
            "inline-flex";

    } else {

        deliveryLinkBtn.removeAttribute("href");

        deliveryLinkBtn.style.display =
            "none";

    }

    deliveryModal.classList.add(
        "active-delivery-modal"
    );

}

typeFilterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentTypeFilter =
            button.dataset.type || "all";

        setActiveFilter(
            typeFilterButtons,
            button
        );

        renderProjects();

    });

});

statusFilterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentStatusFilter =
            button.dataset.status || "all";

        setActiveFilter(
            statusFilterButtons,
            button
        );

        renderProjects();

    });

});

searchProject.addEventListener(
    "input",
    renderProjects
);

closeDeliveryModal.addEventListener(
    "click",
    () => {

        deliveryModal.classList.remove(
            "active-delivery-modal"
        );

    }
);

deliveryModal.addEventListener(
    "click",
    (event) => {

        if (event.target === deliveryModal) {

            deliveryModal.classList.remove(
                "active-delivery-modal"
            );

        }

    }
);

loadProjects();
