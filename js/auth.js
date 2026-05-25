const authToast =
    document.querySelector(
        ".auth-toast"
    );

const authToastMessage =
    document.getElementById(
        "authToastMessage"
    );

function showAuthToast(message) {

    authToastMessage.textContent =
        message;

    authToast.classList.add(
        "show-toast"
    );

    setTimeout(() => {

        authToast.classList.remove(
            "show-toast"
        );

    }, 3000);

}

/* ========================= */
/* REGISTER */
/* ========================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const full_name =
                document.getElementById(
                    "full_name"
                ).value;

            const email =
                document.getElementById(
                    "email"
                ).value;

            const password =
                document.getElementById(
                    "password"
                ).value;

            try {

                const response =
                    await fetch(

                        "http://localhost:3000/api/auth/register",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                full_name,
                                email,
                                password

                            })

                        }

                    );

                const data =
                    await response.json();

                if (response.ok) {

                    showAuthToast(
                        "Cuenta creada correctamente 🚀"
                    );

                    setTimeout(() => {

                        window.location.href =
                            "./login.html";

                    }, 1200);

                } else {

                    showAuthToast(
                        data.error
                    );

                }

            } catch (error) {

                console.error(error);

                showAuthToast(
                    "Error del servidor"
                );

            }

        }
    );

}

/* ========================= */
/* LOGIN */
/* ========================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById(
                    "email"
                ).value;

            const password =
                document.getElementById(
                    "password"
                ).value;

            try {

                const response =
                    await fetch(

                        "http://localhost:3000/api/auth/login",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                email,
                                password

                            })

                        }

                    );

                const data =
                    await response.json();

                if (response.ok) {

                    /* SAVE TOKEN */

                    localStorage.setItem(
                        "token",
                        data.token
                    );

                    /* SAVE USER */

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                    showAuthToast(
                        "Bienvenido 🚀"
                    );

                    /* REDIRECT BY ROLE */

                    setTimeout(() => {

                        if (data.user.role === "admin") {

                            window.location.href =
                                "./admin/dashboard.html";

                        } else if (data.user.role === "mentor") {

                            window.location.href =
                                "./mentor/dashboard.html";

                        } else {

                            window.location.href =
                                "./student/dashboard.html";

                        }

                    }, 1000);

                } else {

                    showAuthToast(
                        data.error
                    );

                }

            } catch (error) {

                console.error(error);

                showAuthToast(
                    "Error del servidor"
                );

            }

        }
    );

}