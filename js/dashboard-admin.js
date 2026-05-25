
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

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
        "../login.html";

    }
);

/* ========================= */
/* DASHBOARD STATS */
/* ========================= */

async function loadDashboardStats() {

    const response =
        await fetch(
            "http://localhost:3000/api/dashboard/stats"
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