const emptyState =
document.querySelector(
    ".empty-mentors"
);

/* ========================= */
/* EMPTY STATE */
/* ========================= */

function checkEmptyState(){

    let visibleCards = 0;

    mentorCards.forEach(card => {

        if(
            card.style.display !== "none" 
        ){

            visibleCards++;

        }

    });

    if(visibleCards === 0){

        emptyState.style.display = "block";

    }else{

        emptyState.style.display = "none";
    }

}

const categoryButtons =
document.querySelectorAll(".mentor-filter");

const companyButtons =
document.querySelectorAll(
    ".mentor-company-filter"
);

const mentorCards =
document.querySelectorAll(".mentor-card");

const mentorSearchInput =
document.querySelector(
    ".mentors-search input"
);

/* ========================= */
/* CATEGORY FILTER */
/* ========================= */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        /* REMOVE CATEGORY ACTIVE */

        categoryButtons.forEach(btn => {

            btn.classList.remove("active-filter");

        });

        /* REMOVE COMPANY ACTIVE */

        companyButtons.forEach(btn => {

            btn.classList.remove("active-company");

        });

        /* ACTIVE CURRENT */

        button.classList.add("active-filter");

        const filter =
        button.dataset.filter;

        mentorCards.forEach(card => {

            const category =
            card.dataset.category;

            if(
                filter === "all" ||
                category === filter
            ){

                card.style.display = "grid";

            }else{

                card.style.display = "none";
            }

        });
        checkEmptyState();

    });

});

/* ========================= */
/* COMPANY FILTER para filtros de empresas*/
/* ========================= */

companyButtons.forEach(button => {

    button.addEventListener("click", () => {

        // REMOVE ACTIVE

        companyButtons.forEach(btn => {

            btn.classList.remove("active-company");

        });

        // ACTIVE CURRENT

        button.classList.add("active-company");

        const company =
        button.dataset.company;

        mentorCards.forEach(card => {

            const mentorCompany =
            card.dataset.company;

            if(
                mentorCompany === company
            ){

                card.style.display = "grid";

            }else{

                card.style.display = "none";
            }

        });

        checkEmptyState();

    });

});

/* ========================= */
/* SEARCH */
/* ========================= */

if(mentorSearchInput){

    mentorSearchInput.addEventListener("input", () => {

        const searchText =
        mentorSearchInput.value.toLowerCase();

        mentorCards.forEach(card => {

            const mentorName =
            card.querySelector("h3")
            .textContent
            .toLowerCase();

            const mentorRole =
            card.querySelector(".mentor-top span")
            .textContent
            .toLowerCase();

            const mentorCategory =
            card.dataset.category
            .toLowerCase();

            const mentorCompany =
            card.dataset.company
            .toLowerCase();

            if(

                mentorName.includes(searchText) ||

                mentorRole.includes(searchText) ||

                mentorCategory.includes(searchText) ||

                mentorCompany.includes(searchText)

            ){

                card.style.display = "grid";

            }else{

                card.style.display = "none";
            }

        });

        checkEmptyState();

    });

}

/* ========================= */
/* MODAL */
/* ========================= */

const mentorModal =
document.querySelector(
    ".mentor-modal"
);

const modalButtons =
document.querySelectorAll(
    ".mentor-btn"
);

const closeModal =
document.querySelector(
    ".close-modal"
);

/* MODAL ELEMENTS */

const modalName =
document.getElementById(
    "modalName"
);

const modalRole =
document.getElementById(
    "modalRole"
);

const modalDescription =
document.getElementById(
    "modalDescription"
);

const modalImage =
document.getElementById(
    "modalImage"
);

const modalTags =
document.getElementById(
    "modalTags"
);

/* OPEN MODAL */

modalButtons.forEach(button => {

    button.addEventListener("click", () => {

        const name =
        button.dataset.name;

        const role =
        button.dataset.role;

        const description =
        button.dataset.description;

        const image =
        button.dataset.image;

        const tags =
        button.dataset.tags
        .split(",");

        /* INSERT DATA */

        modalName.textContent =
        name;

        modalRole.textContent =
        role;

        modalDescription.textContent =
        description;

        modalImage.src =
        image;

        /* TAGS */

        modalTags.innerHTML = "";

        tags.forEach(tag => {

            modalTags.innerHTML += `

                <span>
                    ${tag}
                </span>

            `;

        });

        /* OPEN */

        mentorModal.classList.add(
            "active-modal"
        );

    });

});

/* CLOSE */

if(closeModal){

    closeModal.addEventListener(
        "click",
        () => {

            mentorModal.classList.remove(
                "active-modal"
            );

        }
    );

}

/* CLOSE OUTSIDE */

if(mentorModal){

    mentorModal.addEventListener(
        "click",
        (e) => {

            if(
                e.target === mentorModal
            ){

                mentorModal.classList.remove(
                    "active-modal"
                );

            }

        }
    );

}