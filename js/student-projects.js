
const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!user) {

    window.location.href =
        "../login.html";

}

const studentProjectsGrid =
    document.getElementById(
        "studentProjectsGrid"
    );

const projectModal =
    document.querySelector(
        ".project-modal"
    );

const openProjectModal =
    document.getElementById(
        "openProjectModal"
    );

const closeProjectModal =
    document.querySelector(
        ".close-project-modal"
    );

const projectForm =
    document.getElementById(
        "projectForm"
    );

const projectCourse =
    document.getElementById(
        "projectCourse"
    );

/* MODAL */

openProjectModal.addEventListener(
    "click",
    () => {
        
        editingProjectId =
            null;

        projectForm.reset();

        projectModal.classList.add(
            "active-modal"
        );

    }
);

function openEditProjectModal(project) {

    editingProjectId =
        project.id;

    projectTitle.value =
        project.title;

    projectDescription.value =
        project.description;

    projectUrl.value =
        project.project_url;

    projectCourse.value =
        project.course_id;

    projectModal.classList.add(
        "active-modal"
    );

}

closeProjectModal.addEventListener(
    "click",
    () => {

        projectModal.classList.remove(
            "active-modal"
        );

    }
);

/* LOAD COURSES UNLOCKED */

async function loadCoursesForProjects() {

    const studentResponse =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    const studentCourses =
        await studentResponse.json();

    const coursesResponse =
        await fetch(
            `${API_URL}/api/courses`
        );

    const courses =
        await coursesResponse.json();

    const unlockedRelations =
        studentCourses.filter(
            item => item.unlocked === true
        );

    projectCourse.innerHTML = `

        <option value="">
            Selecciona un curso
        </option>

    `;

    unlockedRelations.forEach(relation => {

        const course =
            courses.find(
                c => c.id === relation.course_id
            );

        if (!course) return;

        projectCourse.innerHTML += `

            <option value="${course.id}">
                ${course.title}
            </option>

        `;

    });

}

/* LOAD PROJECTS */

async function loadStudentProjects() {

    const response =
        await fetch(
            `${API_URL}/api/projects`
        );

    const projects =
        await response.json();

    const myProjects =
        projects.filter(
            project => project.user_id === user.id
        );

    studentProjectsGrid.innerHTML = "";

    if (myProjects.length === 0) {

        studentProjectsGrid.innerHTML = `

            <div class="empty-state">

                <h3>
                    Aún no tienes proyectos enviados
                </h3>

                <p>
                    Cuando subas un proyecto, aparecerá aquí con su estado y feedback.
                </p>

            </div>

        `;

        return;

    }

    myProjects.forEach(project => {

        studentProjectsGrid.innerHTML += `

            <div class="project-card">

                <h3>
                    ${project.title}
                </h3>

                <p>
                    ${project.description || ""}
                </p>

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

                <div class="project-actions">

                <button
                    class="edit-project-btn"
                    onclick='openEditProjectModal(${JSON.stringify(project)})'
                >
                     Editar
                </button>

                <button
                    class="delete-project-btn"
                    onclick="deleteStudentProject('${project.id}')"
                >
                    Eliminar
                </button>

                </div>

                ${project.feedback
                ?
                `
                    <div class="feedback-box">
                        <strong>Feedback</strong>
                        <p>${project.feedback}</p>
                    </div>
                    `
                :
                ""
            }

            </div>

        `;

    });

}

/* CREATE PROJECT */

projectForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const projectData = {

            user_id:
                user.id,

            course_id:
                projectCourse.value,

            lesson_id:
                null,

            title:
                projectTitle.value,

            description:
                projectDescription.value,

            project_url:
                projectUrl.value,

            status:
                "pending"

        };

        if (editingProjectId) {

            await fetch(
                `${API_URL}/api/projects/${editingProjectId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(projectData)
                }
            );

        } else {

            await fetch(
                `${API_URL}/api/projects`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(projectData)
                }
            );

        }

        editingProjectId =
            null;

        projectModal.classList.remove(
            "active-modal"
        );

        loadStudentProjects();

    }
);

async function deleteStudentProject(projectId) {

    await fetch(
        `${API_URL}/api/projects/${projectId}`,
        {
            method: "DELETE"
        }
    );

    loadStudentProjects();

}

/* INIT */

loadCoursesForProjects();

loadStudentProjects();