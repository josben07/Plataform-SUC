const menuToggle =
document.getElementById('menu-toggle');

const navMenu =
document.querySelector('.nav-menu');

if(menuToggle && navMenu){

    menuToggle.addEventListener('click', () => {

        navMenu.classList.toggle('active');

    });

}


/* NAVBAR SCROLL */

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {

    if (window.scrollY > 40) {

        navbar.classList.add('scrolled');

    } else {

        navbar.classList.remove('scrolled');

    }

});

/* ========================= */
/* DARK MODE */
/* ========================= */

const themeToggle =
    document.getElementById("theme-toggle");

/* LOAD SAVED THEME */

if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark-mode");

    themeToggle.textContent = "☀️";
}

/* TOGGLE THEME */

if(themeToggle){

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        /* SAVE */

        if(document.body.classList.contains("dark-mode")){

            localStorage.setItem("theme", "dark");

            themeToggle.textContent = "☀️";

        }else{

            localStorage.setItem("theme", "light");

            themeToggle.textContent = "🌙";
        }
    });

}

/* ========================= */
/* SESSION CHECK */
/* ========================= */

(async function verifySession() {

    const token =
        localStorage.getItem("token");

    if (!token) return;

    const loginPage =
        window.location.pathname
            .includes("login.html");

    const registerPage =
        window.location.pathname
            .includes("registrar.html");

    if (
        loginPage ||
        registerPage
    ) return;

    try {

        const response =
            await fetch(

                `${API_URL}/api/auth/verify`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );

        if (!response.ok) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );
        }

    } catch (e) {

        console.error(e);

    }

})();   

