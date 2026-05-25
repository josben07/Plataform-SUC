/* ========================= */
/* COURSE MODAL */
/* ========================= */

const courseModal =
    document.querySelector(".course-modal");

const courseButtons =
    document.querySelectorAll(".course-btn");

const closeCourseModal =
    document.querySelector(".close-course-modal");

/* ELEMENTS */

const modalCourseTitle =
    document.getElementById("modalCourseTitle");

const modalCourseCategory =
    document.getElementById("modalCourseCategory");

const modalCourseDescription =
    document.getElementById("modalCourseDescription");
const modalCourseDuration =
    document.getElementById(
        "modalCourseDuration"
    );

const modalCourseImage =
    document.getElementById("modalCourseImage");

const modalCourseModules =
    document.getElementById("modalCourseModules");

const modalCourseSkills =
    document.getElementById("modalCourseSkills");

/* OPEN MODAL */

courseButtons.forEach(button => {

    button.addEventListener("click", () => {

        /* GET DATA */

        const title =
            button.dataset.title;

        const category =
            button.dataset.category;

        const description =
            button.dataset.description;

        const duration =
            button.dataset.duration;

        const image =
            button.dataset.image;

        const modules =
            button.dataset.modules.split(",");

        const skills =
            button.dataset.skills
                .split(",")
                .map(skill => skill.trim());

        /* INSERT DATA */

        modalCourseTitle.textContent =
            title;

        modalCourseCategory.textContent =
            category;

        modalCourseDescription.textContent =
            description;
            
        modalCourseDuration.textContent =
            "⏱ " + duration;

        modalCourseImage.src =
            image;

        modalCourseModules.innerHTML = "";

        /* MODULES */

        modalCourseModules.innerHTML = "";

        modules.forEach((module, moduleIndex) => {

            const parts =
                module.split(":");

            const moduleTitle =
                parts[0];

            const lessons =
                parts[1].split("|");

            let lessonsHTML = "";

            lessons.forEach((lesson, lessonIndex) => {

                lessonsHTML += `

            <li>

                ${moduleIndex + 1}.${lessonIndex}

                ${lesson}

            </li>

        `;

            });

            modalCourseModules.innerHTML += `

        <div class="module-item">

            <div class="module-header">

                <span class="module-arrow">

                    ▶

                </span>

                <h4>

                    Módulo ${moduleIndex + 1}:
                    ${moduleTitle}

                </h4>

            </div>

            <ul class="module-lessons">

                ${lessonsHTML}

            </ul>

        </div>

    `;

        });

        /* SKILLS */

        modalCourseSkills.innerHTML = "";

        skills.forEach(skill => {

            modalCourseSkills.innerHTML += `

        <span>

            ${skill}

        </span>

    `;

        });

        /* ========================= */
        /* COLLAPSABLE MODULES */
        /* ========================= */

        const moduleHeaders =
            document.querySelectorAll(
                ".module-header"
            );

        moduleHeaders.forEach(header => {

            header.addEventListener(
                "click",
                () => {

                    const moduleItem =
                        header.parentElement;

                    moduleItem.classList.toggle(
                        "active-module"
                    );

                    const arrow =
                        header.querySelector(
                            ".module-arrow"
                        );

                    if (
                        moduleItem.classList.contains(
                            "active-module"
                        )
                    ) {

                        arrow.textContent = "▼";

                    } else {

                        arrow.textContent = "▶";
                    }

                }
            );

        });
        /* OPEN */

        courseModal.classList.add(
            "active-course-modal"
        );

    });

});

/* CLOSE */

if (closeCourseModal) {

    closeCourseModal.addEventListener("click", () => {

        courseModal.classList.remove(
            "active-course-modal"
        );

    });

}

/* CLOSE OUTSIDE */

if (courseModal) {

    courseModal.addEventListener("click", (e) => {

        if (e.target === courseModal) {

            courseModal.classList.remove(
                "active-course-modal"
            );

        }

    });

}

