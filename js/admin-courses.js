

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

const grid =
    document.getElementById(
        "coursesGrid"
    );

const modal =
    document.querySelector(
        ".course-modal"
    );

const closeModalBtn =
    document.querySelector(
        ".close-modal"
    );

const openModalBtn =
    document.getElementById(
        "openModalBtn"
    );

const courseForm =
    document.getElementById(
        "courseForm"
    );

/* OPEN MODAL */

openModalBtn.addEventListener(
    "click",
    () => {

        modal.classList.add(
            "active-modal"
        );

    }
);

/* CLOSE */

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "active-modal"
            );

        }
    );

}

/* CLOSE OUTSIDE */

window.addEventListener(
    "click",
    (e) => {

        if (
            e.target === modal
        ) {

            modal.classList.remove(
                "active-modal"
            );

        }

    }
);

/* ========================= */
/* LOAD COURSES */
/* ========================= */

async function loadCourses() {
    const response = await fetch(`${API_URL}/api/courses`);
    const courses = await response.json();

    grid.innerHTML = "";

    courses.forEach(course => {
        grid.innerHTML += `
            <div class="admin-course-card">
                <img src="${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}" alt="${course.title}">

                <div class="course-content">
                    <span>${course.category}</span>

                    <h3>${course.title}</h3>

                    <p>${course.level}</p>

                    <div class="course-actions">
                        <button
                            class="edit-btn"
                            onclick="editCourse('${course.id}')"
                        >
                            Editar
                        </button>

                        <a
                            href="../admin/course-builder.html?id=${course.id}"

                            class="builder-btn"
                        >

                            Administrar

                        </a>

                        <button
                            class="delete-btn"
                            onclick="
                                courseToDelete === '${course.id}'
                                ? confirmDeleteCourse('${course.id}')
                                : deleteCourse('${course.id}')"
                        >
                            Eliminar
                        </button>
                    </div>

                    ${course.is_locked
                ? `<div class="locked-badge">Bloqueado</div>`
                : ""
            }
                </div>
            </div>
        `;
    });
}

loadCourses();

/* ========================= */
/* DELETE COURSE */
/* ========================= */

let courseToDelete = null;

function deleteCourse(id) {

    courseToDelete =
        id;

    showAdminToast(
        "Presiona nuevamente eliminar para confirmar"
    );

    setTimeout(() => {

        courseToDelete =
            null;

    }, 4000);

}

async function confirmDeleteCourse(id) {

    await fetch(
        `${API_URL}/api/courses/${id}`,
        {
            method: "DELETE"
        }
    );

    showAdminToast(
        "Curso eliminado correctamente"
    );

    loadCourses();

}

let editingCourseId =
    null;

/* ========================= */
/* EDIT */
/* ========================= */

async function editCourse(id) {

    const response =
        await fetch(
            `${API_URL}/api/courses`
        );

    const courses =
        await response.json();

    console.log(courses);

    const course =
        courses.find(c => c.id === id);

    if (!course) return;

    editingCourseId =
        id;

    title.value =
        course.title;

    description.value =
        course.description;

    category.value =
        course.category;

    level.value =
        course.level;

    duration.value =
        course.duration;

    price.value =
        course.price;

    thumbnail.value =
        course.thumbnail;

    is_locked.checked =
        course.is_locked;

    /* SOLO LIMPIAR SI ES NUEVO */

    if (!editingCourseId) {

        courseForm.reset();

    }

    modal.classList.add(
        "active-modal"
    );


}

/* ========================= */
/* CREATE COURSE */
/* ========================= */

courseForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const course = {

            title:
                title.value,

            description:
                description.value,

            category:
                category.value,

            level:
                level.value,

            duration:
                duration.value,

            price:
                Number(price.value),

            thumbnail:
                thumbnail.value,

            is_locked:
                is_locked.checked

        };

        /* UPDATE */

        if (editingCourseId) {

            await fetch(

                `${API_URL}/api/courses/${editingCourseId}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(course)

                }

            );

            editingCourseId =
                null;

        }

        /* CREATE */

        else {

            await fetch(

                `${API_URL}/api/courses`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(course)

                }

            );

        }

        modal.classList.remove(
            "active-modal"
        );

        courseForm.reset();

        loadCourses();

    }
);

