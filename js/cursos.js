/* ========================= */
/* COURSES FROM API */
/* ========================= */

const courseModal =
    document.querySelector(".course-modal");

const closeCourseModal =
    document.querySelector(".close-course-modal");

const coursesGrid =
    document.querySelector(".courses-grid");

const modalCourseTitle =
    document.getElementById("modalCourseTitle");

const modalCourseCategory =
    document.getElementById("modalCourseCategory");

const modalCourseDescription =
    document.getElementById("modalCourseDescription");

const modalCourseDuration =
    document.getElementById("modalCourseDuration");

const modalCourseImage =
    document.getElementById("modalCourseImage");

const modalCourseModules =
    document.getElementById("modalCourseModules");

const modalCourseSkills =
    document.getElementById("modalCourseSkills");

const courseSearch =
    document.getElementById("course-search");

const sortSelect =
    document.getElementById("courses-sort");

let allCourses = [];
let activeCategory = "all";
let searchQuery = "";
let sortBy = "popular";

function renderCategories(courses) {
    const list = document.getElementById("categoryList");
    const cats = [...new Set(courses.map(c => c.category).filter(Boolean))];
    cats.forEach(cat => {
        const norm = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        list.innerHTML += `
            <li>
                <button class="category-filter" data-filter="${norm}">${cat}</button>
            </li>
        `;
    });
    document.querySelectorAll("#categoryList .category-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#categoryList .category-filter").forEach(b => b.classList.remove("active-category"));
            btn.classList.add("active-category");
            activeCategory = btn.dataset.filter;
            renderCourses(allCourses);
        });
    });
}

async function loadCourses() {

    try {

        const res = await fetch(`${API_URL}/api/courses`);
        const courses = await res.json();

        allCourses = courses;

        renderCategories(courses);

        renderCourses(allCourses);

    } catch (err) {

        coursesGrid.innerHTML = `
            <div class="empty-state">
                <h3>Error al cargar cursos</h3>
                <p>No se pudieron cargar los cursos. Intenta nuevamente.</p>
            </div>
        `;

    }

}

async function renderCourses(courses) {

    let filtered = courses;

    if (activeCategory !== "all") {

        const normalize = s =>
            s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        filtered = filtered.filter(c =>
            normalize(c.category || "") === activeCategory
        );

    }

    if (searchQuery) {

        const q = searchQuery.toLowerCase();

        filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q)
        );

    }

    if (sortBy === "recent") {

        filtered.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

    } else {

        filtered.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

    }

    if (filtered.length === 0) {

        coursesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No se encontraron cursos</h3>
                <p>Intenta con otros filtros o términos de búsqueda.</p>
            </div>
        `;

        return;
    }

    coursesGrid.innerHTML = "";

    for (const course of filtered) {

        const category = course.category || "General";
        const duration = course.duration || "";
        const level = course.level || "";
        const thumbnail = course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

        coursesGrid.innerHTML += `
            <div class="course-card" data-course-id="${course.id}">

                <div class="course-image">
                    <img src="${thumbnail}" alt="${course.title}">
                </div>

                <div class="course-info">

                    <span class="course-category">${category}</span>

                    <h3>${course.title}</h3>

                    <p>${course.description || ""}</p>

                    <div class="course-meta">
                        ${duration ? `<span>${duration}</span>` : ""}
                        ${level ? `<span>${level}</span>` : ""}
                    </div>

                    <div class="course-footer">

                        <button class="course-btn">Ver curso</button>

                    </div>

                </div>

            </div>
        `;

    }

    document.querySelectorAll(".course-btn").forEach(btn => {

        btn.addEventListener("click", (e) => {

            const card = e.target.closest(".course-card");
            const courseId = card.dataset.courseId;

            openCourseModal(courseId);

        });

    });

}

async function openCourseModal(courseId) {

    const course = allCourses.find(c => c.id === courseId);

    if (!course) return;

    modalCourseTitle.textContent = course.title;
    modalCourseCategory.textContent = course.category || "General";
    modalCourseDescription.textContent = course.description || "";
    modalCourseDuration.textContent = course.duration ? `⏱ ${course.duration}` : "";
    modalCourseImage.src = course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

    const modSection = document.querySelector(".course-modal-section");
    modalCourseModules.innerHTML = "";

    try {

        const modRes = await fetch(`${API_URL}/api/modules/${course.id}`);
        const modules = await modRes.json();

        if (modules.length === 0) {
            if (modSection) modSection.style.display = "none";
            return;
        }

        if (modSection) modSection.style.display = "block";

        for (let mi = 0; mi < modules.length; mi++) {

            const mod = modules[mi];
            let lessons = [];

            try {

                const lessRes = await fetch(`${API_URL}/api/lessons/${mod.id}`);
                lessons = await lessRes.json();

            } catch (e) {}

            let lessonsHTML = "";

            lessons.forEach((lesson, li) => {

                lessonsHTML += `
                    <li>${mi + 1}.${li + 1} ${lesson.title}</li>
                `;

            });

            modalCourseModules.innerHTML += `
                <div class="module-item">
                    <div class="module-header">
                        <span class="module-arrow">▶</span>
                        <h4>Módulo ${mi + 1}: ${mod.title}</h4>
                    </div>
                    <ul class="module-lessons">${lessonsHTML || "<li style='color:rgba(255,255,255,0.3)'>Sin clases</li>"}</ul>
                </div>
            `;

        }

        document.querySelectorAll(".module-header").forEach(header => {

            header.addEventListener("click", () => {

                const item = header.parentElement;
                item.classList.toggle("active-module");

                const arrow = header.querySelector(".module-arrow");

                arrow.textContent =
                    item.classList.contains("active-module") ? "▼" : "▶";

            });

        });

    } catch (err) {

        console.error(err);

    }

    courseModal.classList.add("active-course-modal");

}

/* CLOSE MODAL */

if (closeCourseModal) {

    closeCourseModal.addEventListener("click", () => {

        courseModal.classList.remove("active-course-modal");

    });

}

if (courseModal) {

    courseModal.addEventListener("click", (e) => {

        if (e.target === courseModal) {

            courseModal.classList.remove("active-course-modal");

        }

    });

}

/* SEARCH */

courseSearch.addEventListener("input", (e) => {

    searchQuery = e.target.value;
    renderCourses(allCourses);

});

/* SORT */

sortSelect.addEventListener("change", (e) => {

    sortBy = e.target.value;
    renderCourses(allCourses);

});

/* INIT */

loadCourses();
