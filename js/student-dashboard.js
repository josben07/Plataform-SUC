const token =
    localStorage.getItem("token");

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!token || !user || user.role !== "student") {

    window.location.href =
        "../login.html";

}

/* USER INFO */

document.getElementById("studentName").textContent =
    `Bienvenido, ${user.full_name}`;

document.getElementById("studentAvatar").textContent =
    user.full_name.charAt(0);

/* LOGOUT */

document.getElementById("logoutBtn").addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "../login.html";

    }
);

/* ELEMENTS */

const studentCoursesGrid =
    document.getElementById("studentCoursesGrid");

let studentFilter =
    "all";

let selectedCategory =
    "all";

let selectedEnrollCourse =
    null;

/* TOAST */

function showStudentToast(message) {

    const toast =
        document.querySelector(".app-toast");

    const toastMessage =
        document.getElementById("appToastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent =
        message;

    toast.classList.add("show-toast");

    setTimeout(() => {

        toast.classList.remove("show-toast");

    }, 3000);

}

/* LOAD COURSES */

async function loadStudentCourses() {

    const response =
        await fetch(
            `${API_URL}/api/courses`
        );

    const courses =
        await response.json();

    renderCategoryPanel(courses);

    const studentResponse =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    const studentCourses =
        await studentResponse.json();

    const activeCourse =
        studentCourses.find(
            item => item.status === "Activo"
        );

    const studentCourseMap =
        new Map(
            studentCourses.map(item => [
                item.course_id,
                item
            ])
        );

    let filteredCourses =
        [...courses];

    if (selectedCategory !== "all") {

        filteredCourses =
            filteredCourses.filter(course =>
                (course.category || "")
                    .toLowerCase()
                    .trim() ===
                selectedCategory
                    .toLowerCase()
                    .trim()
            );

    }

    if (studentFilter === "myCourses") {

        filteredCourses =
            courses.filter(course => {

                const relation =
                    studentCourseMap.get(course.id);

                return relation &&
                    (
                        relation.status === "Activo" ||
                        relation.status === "Completed"
                    );

            });

    }

    if (studentFilter === "locked") {

        filteredCourses =
            courses.filter(course => {

                if (!activeCourse) return false;

                return course.id !== activeCourse.course_id;

            });

    }

    const availableCount =
        activeCourse
            ? 0
            : courses.length;

    const lockedCount =
        activeCourse
            ? courses.filter(
                course =>
                    course.id !== activeCourse.course_id
            ).length
            : 0;

    document.getElementById("availableCourses").textContent =
        availableCount;

    document.getElementById("lockedCourses").textContent =
        lockedCount;

    studentCoursesGrid.innerHTML =
        "";

    if (filteredCourses.length === 0) {

        studentCoursesGrid.innerHTML = `

            <div class="empty-state">

                <h3>
                    No hay cursos para mostrar
                </h3>

                <p>
                    Prueba con otro filtro o categoría.
                </p>

            </div>

        `;

        return;

    }

    filteredCourses.forEach(course => {

        const relation =
            studentCourseMap.get(course.id);

        let courseStatus =
            "Disponible";

        if (relation && relation.status) {

            courseStatus =
                relation.status;

        }

        if (
            activeCourse &&
            course.id !== activeCourse.course_id &&
            courseStatus !== "Completed"
        ) {

            courseStatus =
                "Bloqueado";

        }

        const isActive =
            courseStatus === "Activo";

        const isCompleted =
            courseStatus === "Completed";

        const isBlocked =
            courseStatus === "Bloqueado";

        const isAvailable =
            courseStatus === "Disponible";

        studentCoursesGrid.innerHTML += `

            <div class="
                student-course-card
                ${isBlocked ? "locked-course" : ""}
            ">

                <img
                    src="${course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            }"
                    alt="${course.title}"
                >

                <div class="student-course-info">

                    <span>
                        ${course.category || "Curso"}
                    </span>

                    <h3>
                        ${course.title}
                    </h3>

                    <p>
                        ${course.description || ""}
                    </p>

                    <div class="student-course-status ${courseStatus.toLowerCase()}">
                        ${courseStatus}
                    </div>

                    <button
                        class="student-course-btn ${isBlocked ? "locked-btn" : ""}"
                        onclick="${isActive || isCompleted
                ? `handleCourseAccess('${course.id}')`
                : isAvailable
                    ? `openEnrollModal('${course.id}','${course.title}')`
                    : `showStudentToast('Ya tienes un curso en progreso. Completa el actual para acceder a otros.')`
            }"
                    >
                        ${isActive
                ? "Continuar"
                : isCompleted
                    ? "Ver curso"
                    : isAvailable
                        ? "Inscribirme"
                        : "Bloqueado"
            }
                    </button>

                </div>

            </div>

        `;

    });

}

/* ENROLL MODAL */

function openEnrollModal(courseId, courseName) {

    selectedEnrollCourse = {
        id: courseId,
        name: courseName
    };

    document
        .querySelector(".enroll-modal")
        .classList.add("active-modal");

}

function closeEnrollModal() {

    document
        .querySelector(".enroll-modal")
        .classList.remove("active-modal");

}

async function confirmEnrollCourse() {

    if (!selectedEnrollCourse) return;

    const response =
        await fetch(
            `${API_URL}/api/student-courses/enroll`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        student_id:
                            user.id,

                        course_id:
                            selectedEnrollCourse.id,

                        course_name:
                            selectedEnrollCourse.name

                    })
            }
        );

    const result =
        await response.json();

    closeEnrollModal();

    if (!response.ok) {

        showStudentToast(
            result.error ||
            "No se pudo inscribir al curso"
        );

        return;

    }

    showStudentToast(
        "Curso inscrito correctamente"
    );

    selectedEnrollCourse =
        null;

    loadStudentCourses();

}

/* ACCESS COURSE */

async function handleCourseAccess(courseId) {

    const response =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    const studentCourses =
        await response.json();

    const activeCourse =
        studentCourses.find(
            item => item.status === "Activo"
        );

    if (
        activeCourse &&
        activeCourse.course_id !== courseId
    ) {

        showStudentToast(
            "Ya tienes un curso en progreso. Completa el actual para acceder a otros."
        );

        return;

    }

    window.location.href =
        `./course-player.html?id=${courseId}`;

}

/* STATS */

async function loadStudentStats() {

    const response =
        await fetch(
            `${API_URL}/api/student/stats/${user.id}`
        );

    const stats =
        await response.json();

    document.getElementById("progressPercentage").textContent =
        `${stats.progress}%`;

}

/* FILTERS */

function changeStudentFilter(filter, element) {

    studentFilter =
        filter;

    document
        .querySelectorAll(".student-filter")
        .forEach(btn => {

            btn.classList.remove(
                "active-student-filter"
            );

        });

    element.classList.add(
        "active-student-filter"
    );

    loadStudentCourses();

}

/* CATEGORY PANEL */

function openCategoryPanel() {

    document
        .getElementById("categoryPanel")
        .classList.add("active-category-panel");

}

function closeCategoryPanel() {

    document
        .getElementById("categoryPanel")
        .classList.remove("active-category-panel");

}

function filterByCategory(category) {

    selectedCategory =
        category;

    studentFilter =
        "all";

    closeCategoryPanel();

    loadStudentCourses();

}

function renderCategoryPanel(courses) {

    const categoryList =
        document.getElementById("categoryList");

    if (!categoryList) return;

    const baseCategories = [
        "Marketing",
        "Administración",
        "Tecnología",
        "Finanzas",
        "Diseño",
        "Ventas",
        "Productividad"
    ];

    const courseCategories =
        courses
            .map(course => course.category)
            .filter(category => category);

    const categories =
        [...new Set([
            ...baseCategories,
            ...courseCategories
        ])];

    categoryList.innerHTML =
        "";

    categories.forEach(category => {

        categoryList.innerHTML += `

            <button onclick="filterByCategory('${category}')">
                ${category}
            </button>

        `;

    });

    categoryList.innerHTML += `

        <button onclick="filterByCategory('all')">
            Ver todas
        </button>

    `;

}

/* INIT */  

loadStudentStats();

loadStudentCourses();