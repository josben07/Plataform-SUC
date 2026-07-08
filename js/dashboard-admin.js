
/* ========================= */
/* AUTH CHECK */
/* ========================= */

const token =
localStorage.getItem("token");

const user =
JSON.parse(
    localStorage.getItem("user")
);

/* NO TOKEN */

if(!token){

    window.location.href =
    "../login.html";
}

/* ONLY ADMIN */

if(user.role !== "admin"){

    alert(
        "Acceso denegado"
    );

    window.location.href =
    "../login.html";
}

askKeepSession();

/* ========================= */
/* USER INFO */
/* ========================= */

const avatar =
document.querySelector(
    ".admin-avatar"
);

if(user.full_name){

    avatar.textContent =
    user.full_name.charAt(0);
}

/* ========================= */
/* LOGOUT */
/* ========================= */

const logoutBtn =
document.getElementById(
    "logoutBtn"
);

logoutBtn.addEventListener(
    "click",
    () => {

        logoutUser("../login.html");

    }
);

/* ========================= */
/* DASHBOARD STATS */
/* ========================= */

async function loadDashboardStats() {

    const response =
        await fetch(
            `${API_URL}/api/dashboard/stats`
        );

    const stats =
        await response.json();

    document.getElementById("usersCount").textContent =
        stats.users;

    document.getElementById("coursesCount").textContent =
        stats.courses;

    document.getElementById("projectsCount").textContent =
        stats.projects;

    document.getElementById("paymentsCount").textContent =
        stats.payments;
    
    document.getElementById("mentorCount").textContent =
        stats.mentors;

}

loadDashboardStats();

async function loadLatestUsers() {

    const tbody =
        document.getElementById("latestUsersBody");

    if (!tbody) return;

    try {

        const response =
            await fetch(
                `${API_URL}/api/users`
            );

        const users =
            await response.json();

        if (!response.ok || !Array.isArray(users)) {

            throw new Error("No se pudieron cargar usuarios");

        }

        const latestUsers =
            users.slice(0, 6);

        if (latestUsers.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4">No hay usuarios registrados.</td>
                </tr>
            `;

            return;

        }

        tbody.innerHTML =
            latestUsers
                .map(item => `
                    <tr>
                        <td>${item.full_name || "Sin nombre"}</td>
                        <td>${item.email || "Sin correo"}</td>
                        <td>${item.role || "Sin rol"}</td>
                        <td>
                            <span class="status ${item.status === "active" ? "active-status" : ""}">
                                ${item.status || "Sin estado"}
                            </span>
                        </td>
                    </tr>
                `)
                .join("");

    } catch (error) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">No se pudieron cargar los usuarios.</td>
            </tr>
        `;

    }

}

loadLatestUsers();
