const adminSidebarLogoutBtn =
    document.getElementById("logoutBtn");

if (adminSidebarLogoutBtn) {

    adminSidebarLogoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "../login.html";

    });

}
