

const appToast =
    document.querySelector(".app-toast");

const appToastMessage =
    document.getElementById("appToastMessage");

function showToast(message) {

    if (!appToast || !appToastMessage) return;

    appToastMessage.textContent =
        message;

    appToast.classList.add("show-toast");

    setTimeout(() => {
        appToast.classList.remove("show-toast");
    }, 3000);

}

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!user) {

    window.location.href =
        "../login.html";

}

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const fullName =
    document.getElementById("fullName");

const email =
    document.getElementById("email");

const profileForm =
    document.getElementById("profileForm");

profileAvatar.textContent =
    user.full_name.charAt(0);

profileName.textContent =
    user.full_name;

profileEmail.textContent =
    user.email;

fullName.value =
    user.full_name;

email.value =
    user.email;

profileForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const response =
            await fetch(
                `${API_URL}/api/users/${user.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            full_name:
                                fullName.value,

                            role:
                                user.role,

                            status:
                                user.status || "active"
                        })
                }
            );

        const updated =
            await response.json();

        user.full_name =
            fullName.value;

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        profileName.textContent =
            fullName.value;

        profileAvatar.textContent =
            fullName.value.charAt(0);

        showToast("Perfil actualizado correctamente");

    }
);

/* ========================= */
/* PASSWORD FORM */
/* ========================= */

const passwordForm =
    document.getElementById("passwordForm");

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

if (passwordForm) {

    passwordForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            if (
                newPassword.value !==
                confirmPassword.value
            ) {

                showToast(
                    "Las contraseñas no coinciden"
                );

                return;

            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

            if (!passwordRegex.test(newPassword.value)) {

                showToast(
                    "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
                );

                return;

            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/users/${user.id}/password`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    currentPassword:
                                        currentPassword.value,

                                    newPassword:
                                        newPassword.value
                                })
                        }
                    );

                const data =
                    await response.json();

                if (response.ok) {

                    showToast(
                        "Contraseña actualizada correctamente"
                    );

                    currentPassword.value =
                        "";

                    newPassword.value =
                        "";

                    confirmPassword.value =
                        "";

                } else {

                    showToast(
                        data.error
                    );

                }

            } catch (error) {

                console.error(error);

                showToast(
                    "Error del servidor"
                );

            }

        }
    );

}