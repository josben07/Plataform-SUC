const user = JSON.parse(localStorage.getItem("user"));
const grid = document.getElementById("myCoursesGrid");

function showToast(msg) {
    const t = document.querySelector(".app-toast");
    const m = document.getElementById("appToastMessage");
    if (!t || !m) return;
    m.textContent = msg;
    t.classList.add("show-toast");
    setTimeout(() => t.classList.remove("show-toast"), 3000);
}

async function loadCourses() {
    const [coursesRes, studentRes, mentorsRes, profilesRes] = await Promise.all([
        fetch(`${API_URL}/api/courses`),
        fetch(`${API_URL}/api/student-courses/${user.id}`),
        fetch(`${API_URL}/api/student-mentors/${user.id}`),
        fetch(`${API_URL}/api/mentor-profiles`)
    ]);
    const courses = await coursesRes.json();
    const studentCourses = await studentRes.json();
    const studentMentors = mentorsRes.ok ? await mentorsRes.json() : [];
    const mentorProfiles = profilesRes.ok ? await profilesRes.json() : [];

    const mentorNameMap = new Map(mentorProfiles.map(m => [m.id, m.full_name]));
    const courseMentorMap = new Map();
    studentMentors.forEach(sm => {
        if (sm.status === "active" && sm.mentor_id) {
            courseMentorMap.set(sm.course_id, mentorNameMap.get(sm.mentor_id) || "");
        }
    });

    const courseMap = new Map(courses.map(c => [c.id, c]));

    if (!studentCourses || studentCourses.length === 0) {
        grid.innerHTML = `<div class="empty-state"><h3>No tienes cursos inscritos</h3><p>Explora el catálogo e inscríbete a un curso.</p></div>`;
        return;
    }

    grid.innerHTML = "";

    for (const sc of studentCourses) {
        const course = courseMap.get(sc.course_id);
        if (!course) continue;

        const status = sc.status === "Completed" ? "Completado" : "Activo";
        const isActive = status === "Activo";
        const mentorName = courseMentorMap.get(sc.course_id) || "";

        grid.innerHTML += `
            <div class="course-card">
                <img src="${course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}" alt="${course.title}">
                <div class="course-card-body">
                    <span class="course-category">${course.category || "Curso"}</span>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-desc">${(course.description || "").substring(0, 120)}${(course.description || "").length > 120 ? "..." : ""}</p>
                    ${mentorName ? `<p class="course-mentor">Mentor: ${mentorName}</p>` : ""}
                    <div class="course-status-badge status-${status.toLowerCase()}">${status}</div>
                    <div class="course-actions">
                        <button class="course-btn btn-primary"
                            onclick="window.location.href='./course-player.html?id=${course.id}'">
                            ${isActive ? "Continuar" : "Ver curso"}
                        </button>
                        <button class="course-btn btn-outline" onclick="window.location.href='./select-mentor.html?courseId=${course.id}'">
                            Agendar Mentoría
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

async function enrollCourse(courseId, courseName) {
    const res = await fetch(`${API_URL}/api/student-courses/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: user.id, course_id: courseId, course_name: courseName })
    });
    const result = await res.json();
    if (!res.ok) {
        showToast(result.error || "No se pudo inscribir");
        return;
    }
    showToast("¡Inscrito correctamente!");
    loadCourses();
}

const previewModal = document.querySelector(".preview-modal");
const closePreview = document.querySelector(".close-preview-modal");
if (closePreview) closePreview.addEventListener("click", () => previewModal.classList.remove("active-modal"));
if (previewModal) previewModal.addEventListener("click", (e) => { if (e.target === previewModal) previewModal.classList.remove("active-modal"); });

async function openPreview(courseId) {
    try {
        const res = await fetch(`${API_URL}/api/courses`);
        const courses = await res.json();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        document.getElementById("previewCourseTitle").textContent = course.title;
        document.getElementById("previewCourseDescription").textContent = course.description || "";
        const container = document.getElementById("previewModules");
        container.innerHTML = "<p style='color:rgba(255,255,255,0.4)'>Cargando...</p>";
        previewModal.classList.add("active-modal");
        const modRes = await fetch(`${API_URL}/api/modules/${course.id}`);
        const modules = await modRes.json();
        container.innerHTML = "";
        if (modules.length === 0) {
            container.innerHTML = "<p style='color:rgba(255,255,255,0.4)'>Este curso aún no tiene módulos.</p>";
            return;
        }
        for (let mi = 0; mi < modules.length; mi++) {
            const mod = modules[mi];
            let lessons = [];
            try {
                const lessRes = await fetch(`${API_URL}/api/lessons/${mod.id}`);
                lessons = await lessRes.json();
            } catch (e) {}
            let html = lessons.map((l, li) =>
                `<li>${mi + 1}.${li + 1} ${l.title}</li>`
            ).join("");
            container.innerHTML += `
                <div class="preview-module">
                    <div class="preview-module-header" onclick="toggleModule(this)">
                        <span class="preview-arrow">▶</span>
                        Módulo ${mi + 1}: ${mod.title}
                    </div>
                    <ul class="preview-lesson-list">${html || "<li>Sin clases</li>"}</ul>
                </div>
            `;
        }
    } catch (err) {
        document.getElementById("previewModules").innerHTML = "<p style='color:rgba(255,255,255,0.5)'>Error al cargar.</p>";
    }
}

function toggleModule(header) {
    const mod = header.parentElement;
    mod.classList.toggle("active-preview-module");
    const arrow = header.querySelector(".preview-arrow");
    arrow.textContent = arrow.textContent === "▶" ? "▼" : "▶";
}

loadCourses();
