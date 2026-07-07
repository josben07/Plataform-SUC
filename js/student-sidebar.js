(function () {
    const menu =
        document.querySelector(".student-menu");

    if (!menu) return;

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "dashboard.html";

    const items = [
        {
            href: "./dashboard.html",
            label: "Dashboard",
            pages: ["dashboard.html"]
        },
        {
            href: "./my-courses.html",
            label: "Mis cursos",
            pages: [
                "my-courses.html",
                "course-player.html"
            ]
        },
        {
            href: "./projects.html",
            label: "Proyecto Final",
            pages: ["projects.html"]
        },
        {
            href: "./mentorships.html",
            label: "Mentorías",
            pages: ["mentorships.html"]
        },
        {
            href: "./select-mentor.html",
            label: "Mentores",
            pages: ["select-mentor.html"]
        },
        {
            href: "./notes.html",
            label: "Mis Apuntes",
            pages: ["notes.html"]
        },
        {
            href: "./certificates.html",
            label: "Certificados",
            pages: ["certificates.html"]
        },
        {
            href: "./payments.html",
            label: "Pagos",
            pages: ["payments.html"]
        },
        {
            href: "./profile.html",
            label: "Perfil",
            pages: ["profile.html"]
        }
    ];

    menu.innerHTML =
        items
            .map((item) => {
                const isActive =
                    item.pages.includes(currentPage);

                return `
                    <a
                        href="${item.href}"
                        class="${isActive ? "active-link" : ""}"
                    >
                        ${item.label}
                    </a>
                `;
            })
            .join("");

    const logoutButton =
        document.querySelector("[data-student-logout]");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            logoutUser("../login.html");
        });
    }
})();
