
let allUsers = [];

const adminToast =
    document.querySelector(".admin-toast");

const adminToastMessage =
    document.getElementById("adminToastMessage");

function showAdminToast(message) {

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

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function isProtectedUser(user) {

    return user &&
        user.is_protected === true;

}

/* ========================= */
/* GET USERS */
/* ========================= */

const tableBody =
    document.getElementById(
        "usersTableBody"
    );

async function loadUsers() {

    try {

        const response =
            await fetch(

                `${API_URL}/api/users`

            );

        const users =
            await response.json();

        if (!response.ok) {

            showAdminToast(
                users.error || "No se pudieron cargar los usuarios"
            );

            return;

        }

        allUsers =
            Array.isArray(users)
                ? users
                : [];

        renderUsers(allUsers);

    } catch (error) {

        console.error(error);

        showAdminToast(
            "Error del servidor al cargar usuarios"
        );

    }

}

loadUsers();

const userModal =
    document.querySelector(".user-modal");

const closeUserModal =
    document.querySelector(".close-user-modal");

const userForm =
    document.getElementById("userForm");

const editUserName =
    document.getElementById("editUserName");

const editUserRole =
    document.getElementById("editUserRole");

const editUserStatus =
    document.getElementById("editUserStatus");

const deleteUserModal =
    document.getElementById("deleteUserModal");

const deleteUserMessage =
    document.getElementById("deleteUserMessage");

const cancelDeleteUser =
    document.getElementById("cancelDeleteUser");

const confirmDeleteUser =
    document.getElementById("confirmDeleteUser");

let editingUserId =
    null;

let deletingUserId =
    null;

function openEditUserModal(user) {

    if (isProtectedUser(user)) {

        showAdminToast(
            "Este admin esta protegido"
        );

        return;

    }

    editingUserId =
        user.id;

    editUserName.value =
        user.full_name;

    editUserRole.value =
        user.role;

    editUserStatus.value =
        user.status || "active";

    userModal.classList.add(
        "active-user-modal"
    );

}

function canDeleteUser(user) {

    return user &&
        (user.role === "student" || user.role === "mentor") &&
        !isProtectedUser(user);

}

function openDeleteUserModal(user) {

    if (!canDeleteUser(user)) {

                    showAdminToast(
                        "Solo se pueden eliminar usuarios"
                    );

        return;

    }

    deletingUserId =
        user.id;

    const userType =
        user.role === "mentor" ? "mentor" : "alumno";

    if (deleteUserMessage) {

        deleteUserMessage.innerHTML =
            `&iquest;Est&aacute;s seguro que deseas eliminar todo el historial de <strong>${escapeHtml(user.full_name || user.email || `este ${userType}`)}</strong>?`;

    }

    deleteUserModal.classList.add(
        "active-delete-user-modal"
    );

}

function closeDeleteUserModal() {

    deletingUserId =
        null;

    deleteUserModal.classList.remove(
        "active-delete-user-modal"
    );

}

function renderUsers(users) {

    tableBody.innerHTML = "";

    if (users.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon">👤</div>
                        <h3>No hay usuarios</h3>
                        <p>No se encontraron usuarios.</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    users.forEach(user => {

        const protectedUser =
            isProtectedUser(user);

        const roleLabel =
            protectedUser
                ? `${escapeHtml(user.role)} <span class="protected-badge">Boss</span>`
                : escapeHtml(user.role);

        const editActionHtml =
            protectedUser
                ? `
                    <button
                        class="edit-user-btn protected-user-btn"
                        type="button"
                        disabled
                        title="Admin protegido"
                    >
                        Protegido
                    </button>
                `
                : `
                    <button
                        class="edit-user-btn"
                        type="button"
                        data-user-id="${escapeHtml(user.id)}"
                    >
                        Editar
                    </button>
                `;

        const deleteActionHtml =
            canDeleteUser(user)
                ? `
                    <button
                        class="delete-user-btn"
                        type="button"
                        data-delete-user-id="${escapeHtml(user.id)}"
                    >
                        Eliminar
                    </button>
                `
                : "";

        tableBody.innerHTML += `

            <tr>

                <td>${escapeHtml(user.full_name)}</td>

                <td>${escapeHtml(user.email)}</td>

                <td>${roleLabel}</td>

                <td>
                    <span class="${user.status === "blocked" ? "blocked-status" : "active-status"}">
                        ${user.status === "blocked" ? "Bloqueado" : "Activo"}
                    </span>
                </td>

                <td>
                    <div class="user-actions">
                        ${editActionHtml}
                        ${deleteActionHtml}
                    </div>
                </td>

            </tr>

        `;

    });

    tableBody
        .querySelectorAll(".edit-user-btn[data-user-id]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const selectedUser =
                    allUsers.find(user =>
                        String(user.id) === String(button.dataset.userId)
                    );

                if (selectedUser) {

                    openEditUserModal(selectedUser);

                }

            });

        });

    tableBody
        .querySelectorAll(".delete-user-btn[data-delete-user-id]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const selectedUser =
                    allUsers.find(user =>
                        String(user.id) === String(button.dataset.deleteUserId)
                    );

                if (selectedUser) {

                    openDeleteUserModal(selectedUser);

                }

            });

        });

}

closeUserModal.addEventListener(
    "click",
    () => {

        userModal.classList.remove(
            "active-user-modal"
        );

    }
);

if (cancelDeleteUser) {

    cancelDeleteUser.addEventListener(
        "click",
        closeDeleteUserModal
    );

}

if (confirmDeleteUser) {

    confirmDeleteUser.addEventListener(
        "click",
        async () => {

            if (!deletingUserId) return;

            confirmDeleteUser.disabled =
                true;

            confirmDeleteUser.textContent =
                "Eliminando...";

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/users/${deletingUserId}`,
                        {
                            method:
                                "DELETE"
                        }
                    );

                const result =
                    await response.json().catch(() => ({}));

                if (!response.ok) {

                    showAdminToast(
                        result.error || "No se pudo eliminar el usuario"
                    );

                    return;

                }

                closeDeleteUserModal();

                showAdminToast(
                    result.message || "Usuario eliminado correctamente"
                );

                loadUsers();

            } catch (error) {

                console.error(error);

                showAdminToast(
                    "Error del servidor al eliminar"
                );

            } finally {

                confirmDeleteUser.disabled =
                    false;

                confirmDeleteUser.textContent =
                    "Eliminar todo";

            }

        }
    );

}

userForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const response =
            await fetch(
            `${API_URL}/api/users/${editingUserId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        full_name:
                            editUserName.value,

                        role:
                            editUserRole.value,

                        status:
                            editUserStatus.value
                    })
            }
        );

        const result =
            await response.json().catch(() => ({}));

        if (!response.ok) {

            showAdminToast(
                result.error || "No se pudo actualizar el usuario"
            );

            return;

        }

        userModal.classList.remove(
            "active-user-modal"
        );

        showAdminToast(
            "Usuario actualizado correctamente"
        );

        loadUsers();

    }
);

const searchUser =
    document.getElementById("searchUser");

if (searchUser) {

    searchUser.addEventListener("input", () => {

        const value =
            searchUser.value.toLowerCase();

        const filteredUsers =
            allUsers.filter(user =>

                String(user.full_name || "")
                    .toLowerCase()
                    .includes(value)

                ||

                String(user.email || "")
                    .toLowerCase()
                    .includes(value)

                ||

                String(user.role || "")
                    .toLowerCase()
                    .includes(value)

            );

        renderUsers(filteredUsers);

    });

}
