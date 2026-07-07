const adminSidebarLogoutBtn =
    document.getElementById("logoutBtn");

if (adminSidebarLogoutBtn) {

    adminSidebarLogoutBtn.addEventListener("click", () => {

        logoutUser("../login.html");

    });

}
