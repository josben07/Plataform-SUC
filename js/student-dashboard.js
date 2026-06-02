
const progressText =
    document.querySelector(
        ".student-stat-card h2:nth-of-type(3)"
    );

const token =
    localStorage.getItem("token");

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!token || !user) {

    window.location.href =
        "../login.html";

}

if (user.role !== "student") {

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

/* LOAD COURSES */

const studentCoursesGrid =
    document.getElementById("studentCoursesGrid");
let studentFilter =
    "all";
let selectedCategory =
    "all";

async function loadStudentCourses() {

    const response =
        await fetch(`${API_URL}/api/courses`);

    const courses =
        await response.json();

    renderCategoryPanel(courses);

    const studentResponse =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    const studentCourses =
        await studentResponse.json();

    const unlockedIds =
        studentCourses
            .filter(item => item.unlocked === true)
            .map(item => item.course_id);

    let filteredCourses =
        courses;


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

                const isCourseLocked =
                    course.is_locked === true;

                const isPaidUnlocked =
                    unlockedIds.includes(course.id);

                return !isCourseLocked || isPaidUnlocked;

            });

    }

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

    if (studentFilter === "locked") {

        filteredCourses =
            courses.filter(course => {

                const isCourseLocked =
                    course.is_locked === true;

                const isPaidUnlocked =
                    unlockedIds.includes(course.id);

                return isCourseLocked && !isPaidUnlocked;

            });

    }

    const availableCourses =
        courses.filter(course => {

            const isCourseLocked =
                course.is_locked === true;

            const isPaidUnlocked =
                unlockedIds.includes(course.id);

            return !isCourseLocked || isPaidUnlocked;

        });

    const lockedCourses =
        courses.filter(course => {

            const isCourseLocked =
                course.is_locked === true;

            const isPaidUnlocked =
                unlockedIds.includes(course.id);

            return isCourseLocked && !isPaidUnlocked;

        });

    document.getElementById("availableCourses").textContent =
        availableCourses.length;

    document.getElementById("lockedCourses").textContent =
        lockedCourses.length;

    studentCoursesGrid.innerHTML = "";

    filteredCourses.forEach(course => {

        const isCourseLocked =
            course.is_locked === true;

        const isPaidUnlocked =
            unlockedIds.includes(course.id);

        const canAccess =
            !isCourseLocked || isPaidUnlocked;

        studentCoursesGrid.innerHTML += `

            <div class="student-course-card ${!canAccess ? "locked-course" : ""}">

                <img
                    src="${course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}"
                >

                <div class="student-course-info">

                    <span>${course.category || "Curso"}</span>

                    <h3>${course.title}</h3>

                    <p>${course.description || ""}</p>

                    <button
                        class="student-course-btn ${!canAccess ? "locked-btn" : ""}"
                        onclick="${canAccess
                ? `window.location.href='./course-player.html?id=${course.id}'`
                : `buyCourse('${course.id}','${course.title}')`
            }"
                    >
                        ${canAccess
                ? "Continuar"
                : "Comprar curso"
            }
                    </button>

                </div>

            </div>

        `;

    });

}

function showStudentToast(message) {

    alert(message);

}

async function buyCourse(

    courseId,
    courseName

) {

    const response =
        await fetch(

            `${API_URL}/api/student-courses/buy`,

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

                        student_name:
                            user.full_name,

                        course_id:
                            courseId,

                        course_name:
                            courseName

                    })

            }

        );

    const result =
        await response.json();

    console.log(result);

    if (!response.ok) {

        showStudentToast(

            result.error ||
            "No se pudo solicitar el curso"

        );

        return;

    }

    showStudentToast(

        "Solicitud enviada al administrador"

    );

    loadStudentCourses();

}

/* LOAD STUDENT STATS */

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

    categoryList.innerHTML = "";

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

loadStudentStats();

loadStudentCourses();