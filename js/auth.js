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
/* SUPABASE CLIENT */
/* ========================= */

const supabaseClient =
    supabase
        ? supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        )
        : null;

/* ========================= */
/* REDIRECT BY ROLE */
/* ========================= */

function redirectByRole(user) {

    setTimeout(() => {

        if (user.role === "admin") {

            window.location.href =
                "./admin/dashboard.html";

        } else if (user.role === "mentor") {

            window.location.href =
                "./mentor/dashboard.html";

        } else {

            window.location.href =
                "./student/dashboard.html";

        }

    }, 1000);

}

/* ========================= */
/* GOOGLE CALLBACK */
/* ========================= */

async function handleGoogleCallback() {

    if (!supabaseClient) return;

    const {
        data:
        { session }
    } =
        await supabaseClient.auth.getSession();

    if (!session) return;

    if (
        localStorage.getItem(
            "token"
        )
    ) return;

    const accessToken =
        session.access_token;

    if (!accessToken) {

        showAuthToast(
            "Error al obtener sesión de Google"
        );

        return;

    }

    try {

        const response =
            await fetch(

                `${API_URL}/api/auth/google`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        accessToken

                    })

                }

            );

        const data =
            await response.json();

        if (response.ok) {

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            showAuthToast(
                "Bienvenido 🚀"
            );

            redirectByRole(data.user);

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

/* ========================= */
/* GOOGLE LOGIN */
/* ========================= */

async function signInWithGoogle() {

    if (!supabaseClient) {

        showAuthToast(
            "Error de configuración"
        );

        return;

    }

    const redirectTo =
        window.location.origin +
        window.location.pathname;

    const {
        error
    } =
        await supabaseClient.auth.signInWithOAuth({

            provider: "google",

            options: {

                redirectTo

            }

        });

    if (error) {

        showAuthToast(
            error.message
        );

    }

}

/* ========================= */
/* SESSION CHECK ON LOAD */
/* ========================= */

async function checkSession() {

    const token =
        localStorage.getItem(
            "token"
        );

    const userJson =
        localStorage.getItem(
            "user"
        );

    if (
        token &&
        userJson
    ) {

        const user =
            JSON.parse(userJson);

        const loginCard =
            document.querySelector(
                ".login-card"
            );

        if (loginCard) {

            redirectByRole(user);

        }

        return;

    }

    await handleGoogleCallback();

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

                        `${API_URL}/api/auth/register`,

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

                        `${API_URL}/api/auth/login`,

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

                    redirectByRole(data.user);

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
/* GOOGLE BTN */
/* ========================= */

const googleBtn =
    document.getElementById(
        "googleLoginBtn"
    );

if (googleBtn) {

    googleBtn.addEventListener(
        "click",
        signInWithGoogle
    );

}

/* ========================= */
/* INIT */
/* ========================= */

checkSession();