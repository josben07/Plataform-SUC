
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

        allUsers = users;

        renderUsers(allUsers);
        return;

        tableBody.innerHTML = "";

        users.forEach(user => {

            tableBody.innerHTML += `

                <tr>

                    <td>

                        ${user.full_name}

                    </td>

                    <td>

                        ${user.email}

                    </td>

                    <td>

                        ${user.role}

                    </td>

                    <td>

                        <span class="${user.status === "blocked"
                    ? "blocked-status"
                    : "active-status"
                }">

                            ${user.status === "blocked"
                    ? "Bloqueado"
                    : "Activo"
                }

                        </span>

                    </td>

                    <td>

                        <button
                            class="edit-user-btn"
                            onclick='openEditUserModal(${JSON.stringify(user)})'
                        >

                            Editar

                        </button>

                    </td>

                </tr>

            `;

        });

        if (users.length === 0) {

            tableBody.innerHTML = `

        <tr>

            <td colspan="5">

                <div class="empty-state">

                    <div class="empty-icon">

                        👤

                    </div>

                    <h3>

                        No hay usuarios

                    </h3>

                    <p>

                        Aún no hay usuarios registrados.

                    </p>

                </div>

            </td>

        </tr>

    `;

            return;

        }

    } catch (error) {

        console.error(error);

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

let editingUserId =
    null;

function openEditUserModal(user) {

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

        tableBody.innerHTML += `

            <tr>

                <td>${user.full_name}</td>

                <td>${user.email}</td>

                <td>${user.role}</td>

                <td>
                    <span class="${user.status === "blocked" ? "blocked-status" : "active-status"}">
                        ${user.status === "blocked" ? "Bloqueado" : "Activo"}
                    </span>
                </td>

                <td>
                    <button
                        class="edit-user-btn"
                        onclick='openEditUserModal(${JSON.stringify(user)})'
                    >
                        Editar
                    </button>
                </td>

            </tr>

        `;

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

userForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

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

        userModal.classList.remove(
            "active-user-modal"
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

                user.full_name
                    .toLowerCase()
                    .includes(value)

                ||

                user.email
                    .toLowerCase()
                    .includes(value)

                ||

                user.role
                    .toLowerCase()
                    .includes(value)

            );

        renderUsers(filteredUsers);

    });

}