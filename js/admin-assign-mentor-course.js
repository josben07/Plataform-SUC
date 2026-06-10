const adminToast =
    document.querySelector(".admin-toast");

const adminToastMessage =
    document.getElementById("adminToastMessage");

function showAdminToast(message) {

    adminToastMessage.textContent =
        message;

    adminToast.classList.add("show-toast");

    setTimeout(() => {
        adminToast.classList.remove("show-toast");
    }, 3000);

}

const assignMentorSelect =
    document.getElementById("assignMentorSelect");

const assignCourseSelect =
    document.getElementById("assignCourseSelect");

const assignBtn =
    document.getElementById("assignBtn");

const assignmentsGrid =
    document.getElementById("assignmentsGrid");

let allMentors = [];
let allCourses = [];
let allAssignments = [];

/* LOAD MENTORS */

async function loadMentors() {

    const response =
        await fetch(`${API_URL}/api/mentor-profiles`);

    allMentors =
        await response.json();

    assignMentorSelect.innerHTML = `

        <option value="">
            Seleccionar mentor
        </option>

    `;

    allMentors.forEach(mentor => {

        assignMentorSelect.innerHTML += `

            <option value="${mentor.id}">
                ${mentor.full_name}
            </option>

        `;

    });

}

/* LOAD COURSES */

async function loadCourses() {

    const response =
        await fetch(`${API_URL}/api/courses`);

    allCourses =
        await response.json();

    assignCourseSelect.innerHTML = `

        <option value="">
            Seleccionar curso
        </option>

    `;

    allCourses.forEach(course => {

        assignCourseSelect.innerHTML += `

            <option value="${course.id}">
                ${course.title}
            </option>

        `;

    });

}

/* LOAD ASSIGNMENTS */

async function loadAssignments() {

    const response =
        await fetch(`${API_URL}/api/course-mentors`);

    allAssignments =
        await response.json();

    renderAssignments();

}

/* RENDER */

function getMentorName(mentorId) {

    const mentor =
        allMentors.find(m => m.id === mentorId);

    return mentor
        ? mentor.full_name
        : "Desconocido";

}

function getCourseName(courseId) {

    const course =
        allCourses.find(c => c.id === courseId);

    return course
        ? course.title
        : "Desconocido";

}

function renderAssignments() {

    assignmentsGrid.innerHTML = "";

    if (allAssignments.length === 0) {

        assignmentsGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    Sin asignaciones
                </h3>

                <p>
                    Aún no hay mentores asignados a cursos.
                </p>

            </div>

        `;

        return;

    }

    allAssignments.forEach(item => {

        assignmentsGrid.innerHTML += `

            <div class="admin-course-card">

                <div class="course-content">

                    <span>
                        ${getCourseName(item.course_id)}
                    </span>

                    <h3>
                        ${getMentorName(item.mentor_id)}
                    </h3>

                    <p>
                        Mentor asignado a este curso
                    </p>

                    <div class="course-actions">

                        <button
                            class="delete-btn"
                            onclick="removeAssignment('${item.id}')"
                        >
                            Eliminar
                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}

/* ASSIGN */

assignBtn.addEventListener("click", async () => {

    const mentor_id =
        assignMentorSelect.value;

    const course_id =
        assignCourseSelect.value;

    if (!mentor_id || !course_id) {

        showAdminToast(
            "Selecciona un mentor y un curso"
        );

        return;

    }

    const response =
        await fetch(
            `${API_URL}/api/course-mentors`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        mentor_id,
                        course_id
                    })
            }
        );

    if (response.ok) {

        showAdminToast(
            "Mentor asignado al curso correctamente"
        );

        assignMentorSelect.value = "";
        assignCourseSelect.value = "";

        loadAssignments();

    } else {

        const data =
            await response.json();

        showAdminToast(
            data.error ||
            "Error al asignar"
        );

    }

});

/* REMOVE */

async function removeAssignment(id) {

    const response =
        await fetch(
            `${API_URL}/api/course-mentors/${id}`,
            { method: "DELETE" }
        );

    if (response.ok) {

        showAdminToast(
            "Asignación eliminada"
        );

        loadAssignments();

    } else {

        showAdminToast(
            "Error al eliminar"
        );

    }

}

/* INIT */

async function init() {

    await Promise.all([
        loadMentors(),
        loadCourses()
    ]);

    await loadAssignments();

}

init();
