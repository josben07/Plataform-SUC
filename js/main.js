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
/* FILTER COURSES */
/* ========================= */

const filterButtons =
    document.querySelectorAll(".category-filter");

const courseCards =
    document.querySelectorAll(".course-card");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // REMOVE ACTIVE
        filterButtons.forEach(btn => {

            btn.classList.remove("active-category");

        });

        // ACTIVE
        button.classList.add("active-category");

        const filter =
            button.dataset.filter;

        courseCards.forEach(card => {

            if (
                filter === "all"
                ||
                card.dataset.category === filter
            ) {

                card.style.display = "block";

            } else {

                card.style.display = "none";
            }

        });

    });

});

/* ========================= */
/* SORT COURSES */
/* ========================= */

const sortSelect =
document.getElementById("courses-sort");

const coursesGrid =
document.querySelector(".courses-grid");

// SAVE ORIGINAL
const originalCards =
Array.from(
    document.querySelectorAll(".course-card")
);

if(sortSelect){

    sortSelect.addEventListener("change", sortCourses);

}

function sortCourses(){

    const value =
    sortSelect.value;

    // COPY ARRAY
    let sortedCards =
    [...originalCards];

    // SORT
    sortedCards.sort((a,b) => {

        // POPULAR
        if(value === "popular"){

            return (
                Number(b.dataset.popularity)
                -
                Number(a.dataset.popularity)
            );
        }

        // RECENT
        if(value === "recent"){

            return (
                Number(b.dataset.date)
                -
                Number(a.dataset.date)
            );
        }

        // RATING
        if(value === "rating"){

            return (
                Number(b.dataset.rating)
                -
                Number(a.dataset.rating)
            );
        }

        return 0;

    });

    // CLEAN GRID
    coursesGrid.innerHTML = "";

    // INSERT AGAIN
    sortedCards.forEach(card => {

        coursesGrid.appendChild(card);

    });

}

/* ========================= */
/* SEARCH COURSES */
/* ========================= */

const searchInput =
document.getElementById("course-search");

if(searchInput){

    searchInput.addEventListener("keyup", () => {

        const value =
        searchInput.value.toLowerCase();

        const cards =
        document.querySelectorAll(".course-card");

        cards.forEach(card => {

            const title =
            card.querySelector("h3")
            .textContent
            .toLowerCase();

            if(title.includes(value)){

                card.style.display = "block";

            }else{

                card.style.display = "none";
            }

        });

    });

}