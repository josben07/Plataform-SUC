
const user =
    JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "mentor") {
    window.location.href = "../login.html";
}

const studentsGrid =
    document.getElementById("studentsGrid");

async function loadStudents() {

    const usersResponse =
        await fetch("http://localhost:3000/api/users");

    const users =
        await usersResponse.json();

    const projectsResponse =
        await fetch("http://localhost:3000/api/projects");

    const projects =
        await projectsResponse.json();

    const sessionsResponse =
        await fetch("http://localhost:3000/api/mentor");

    const sessions =
        await sessionsResponse.json();

    const students =
        users.filter(
            item => item.role === "student"
        );

    studentsGrid.innerHTML = "";

    if (students.length === 0) {

        studentsGrid.innerHTML = `

            <div class="empty-state">
                <h3>No hay estudiantes registrados</h3>
                <p>Cuando existan alumnos, aparecerán aquí.</p>
            </div>

        `;

        return;
    }

    students.forEach(student => {

        const studentProjects =
            projects.filter(
                project => project.user_id === student.id
            );

        const studentSessions =
            sessions.filter(
                session => session.student_id === student.id
            );

        studentsGrid.innerHTML += `

            <div class="student-card">

                <div class="student-avatar">
                    ${student.full_name.charAt(0)}
                </div>

                <h3>${student.full_name}</h3>

                <p>${student.email}</p>

                <div class="student-meta">

                    <span class="student-pill">
                        ${studentProjects.length} proyectos
                    </span>

                    <span class="student-pill">
                        ${studentSessions.length} mentorías
                    </span>

                    <span class="student-pill">
                        ${student.status === "blocked" ? "Bloqueado" : "Activo"}
                    </span>

                </div>

            </div>

        `;

    });

}

loadStudents();