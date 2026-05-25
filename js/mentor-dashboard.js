
const user =
    JSON.parse(
        localStorage.getItem("user")
    );

const token =
    localStorage.getItem("token");

if (!token || !user) {

    window.location.href =
        "../login.html";

}

if (user.role !== "mentor") {

    window.location.href =
        "../login.html";

}

document.getElementById("mentorName").textContent =
    `Bienvenido, ${user.full_name}`;

document.getElementById("mentorAvatar").textContent =
    user.full_name.charAt(0);

document.getElementById("logoutBtn").addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "../login.html";

    }
);

async function loadMentorDashboard() {

    const projectResponse =
        await fetch(
            "http://localhost:3000/api/projects"
        );

    const projects =
        await projectResponse.json();

    const sessionResponse =
        await fetch(
            "http://localhost:3000/api/mentor"
        );

    const sessions =
        await sessionResponse.json();

    const pendingProjects =
        projects.filter(
            project => project.status === "pending"
        );

    const reservedSessions =
        sessions.filter(
            session => session.status === "reserved"
        );

    const studentIds =
        new Set(
            projects.map(project => project.user_id)
        );

    document.getElementById("pendingProjects").textContent =
        pendingProjects.length;

    document.getElementById("reservedSessions").textContent =
        reservedSessions.length;

    document.getElementById("activeStudents").textContent =
        studentIds.size;

    const recentProjects =
        document.getElementById("recentProjects");

    recentProjects.innerHTML = "";

    projects.slice(0, 6).forEach(project => {

        recentProjects.innerHTML += `

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

            </div>

        `;

    });

}

loadMentorDashboard();