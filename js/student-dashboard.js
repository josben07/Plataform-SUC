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

askKeepSession();

/* USER INFO */

document.getElementById("studentName").textContent =
    `Bienvenido, ${user.full_name}`;

document.getElementById("studentAvatar").textContent =
    user.full_name.charAt(0);

const studentRefreshBtn =
    document.getElementById("studentRefreshBtn");

if (studentRefreshBtn) {

    studentRefreshBtn.addEventListener("click", async () => {

        studentRefreshBtn.disabled =
            true;

        studentRefreshBtn.textContent =
            "Recargando...";

        await Promise.all([
            loadStudentStats(),
            loadStudentCourses(),
            loadStudentAlerts()
        ]);

        studentRefreshBtn.disabled =
            false;

        studentRefreshBtn.textContent =
            "Recargar";

        showStudentToast(
            "Dashboard actualizado"
        );

    });

}

/* LOGOUT */

document.getElementById("logoutBtn").addEventListener(
    "click",
    () => {

        logoutUser("../login.html");

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

function clampProgress(progress) {

    return Math.min(
        100,
        Math.max(
            0,
            Number(progress) || 0
        )
    );

}

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

    if (studentFilter === "completedCourses") {

        filteredCourses =
            courses.filter(course => {

                const relation =
                    studentCourseMap.get(course.id);

                return relation &&
                    relation.status === "Completed";

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

                    <button
                        style="margin-top:10px;width:100%;height:42px;border:1px solid rgba(139,124,255,0.3);border-radius:14px;background:rgba(108,77,255,0.1);color:#8B7CFF;font-weight:700;cursor:pointer;"
                        onclick="openCoursePreview('${course.id}')"
                    >
                        Ver temario
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

    const progress =
        clampProgress(stats.progress);

    document.getElementById("progressPercentage").textContent =
        `${progress}%`;

}

async function loadStudentAlerts() {

    const section =
        document.getElementById("studentAlertsSection");

    const grid =
        document.getElementById("studentAlertsGrid");

    if (!section || !grid) return;

    try {

        const [
            projectsRes,
            paymentsRes,
            mentorshipsRes,
            coursesRes
        ] =
            await Promise.all([
                fetch(`${API_URL}/api/projects`),
                fetch(`${API_URL}/api/payments`),
                fetch(`${API_URL}/api/mentor/student/${user.id}`),
                fetch(`${API_URL}/api/student-courses/${user.id}`)
            ]);

        const projects =
            projectsRes.ok ? await projectsRes.json() : [];

        const payments =
            paymentsRes.ok ? await paymentsRes.json() : [];

        const mentorships =
            mentorshipsRes.ok ? await mentorshipsRes.json() : [];

        const studentCourses =
            coursesRes.ok ? await coursesRes.json() : [];

        const myFinalProjects =
            (projects || []).filter(project =>
                project.user_id === user.id &&
                project.submission_type === "final_project"
            );

        const myPayments =
            (payments || []).filter(payment =>
                payment.student_id === user.id ||
                payment.user_name === user.full_name
            );

        const activeCourse =
            (studentCourses || []).find(course =>
                course.status === "Activo"
            );

        if (!activeCourse) {

            grid.innerHTML =
                "";

            section.style.display =
                "none";

            return;

        }

        const alerts =
            [];

        const latestProject =
            myFinalProjects.find(project =>
                project.course_id === activeCourse.course_id
            );

        if (latestProject) {

            const hasMentorship =
                (mentorships || []).some(session =>
                    session.course_id === latestProject.course_id &&
                    [
                        "reserved",
                        "confirmed",
                        "completed"
                    ].includes(session.status)
                );

            if (!hasMentorship) {

                alerts.push({
                    title:
                        "Agenda tu mentoría",
                    text:
                        "Recuerda que debes agendar tu mentoría para ser asesorado en tu proyecto.",
                    href:
                        `./select-mentor.html?courseId=${latestProject.course_id}`,
                    action:
                        "Agendar mentoría"
                });

            }

            if (latestProject.status === "approved") {

                alerts.push({
                    title:
                        "Proyecto aprobado",
                    text:
                        "Tu proyecto final fue aprobado. Completa la mentoría y finaliza el curso para habilitar el certificado.",
                    href:
                        `./course-player.html?id=${latestProject.course_id}`,
                    action:
                        "Ver curso"
                });

            }

        }

        myPayments
            .filter(payment =>
                payment.course_id === activeCourse.course_id
            )
            .forEach(payment => {

            if (payment.status === "pendiente") {

                alerts.push({
                    title:
                        "Pago pendiente",
                    text:
                        "Tienes un pago pendiente. Sube tu comprobante para que el administrador lo revise.",
                    href:
                        "./payments.html",
                    action:
                        "Ir a pagos"
                });

            }

            if (payment.status === "en_revision") {

                alerts.push({
                    title:
                        "Pago en revisión",
                    text:
                        "Tu comprobante fue enviado y está esperando aprobación del administrador.",
                    href:
                        "./payments.html",
                    action:
                        "Ver estado"
                });

            }

            if (payment.status === "aprobado") {

                alerts.push({
                    title:
                        "Pago aprobado",
                    text:
                        "Tu pago fue aprobado. Ya puedes continuar con el siguiente paso.",
                    href:
                        payment.payment_type === "mentor"
                            ? "./mentorships.html"
                            : `./course-player.html?id=${payment.course_id}`,
                    action:
                        "Continuar"
                });

            }

        });

        if (alerts.length === 0) {

            alerts.push({
                title:
                    "Continua tu curso",
                text:
                    "Sigue avanzando con tus clases. Te mostraremos aqui el siguiente paso cuando sea necesario.",
                href:
                    `./course-player.html?id=${activeCourse.course_id}`,
                action:
                    "Ir al curso"
            });

        }

        grid.innerHTML =
            alerts
                .slice(0, 6)
                .map(alert => `
                    <div class="student-alert-card">
                        <strong>${alert.title}</strong>
                        <p>${alert.text}</p>
                        <a href="${alert.href}">${alert.action}</a>
                    </div>
                `)
                .join("");

        section.style.display =
            alerts.length > 0 ? "block" : "none";

    } catch (error) {

        console.error(
            "[student-alerts] Error cargando avisos:",
            error
        );

        section.style.display =
            "none";

    }

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

/* PREVIEW MODAL */

const previewModal =
    document.querySelector(".preview-modal");

const closePreviewModal =
    document.querySelector(".close-preview-modal");

if (closePreviewModal) {

    closePreviewModal.addEventListener("click", () => {

        previewModal.classList.remove("active-modal");

    });

}

if (previewModal) {

    previewModal.addEventListener("click", (e) => {

        if (e.target === previewModal) {

            previewModal.classList.remove("active-modal");

        }

    });

}

async function openCoursePreview(courseId) {

    try {

        const res =
            await fetch(
                `${API_URL}/api/courses`
            );

        const courses =
            await res.json();

        const course =
            courses.find(c => c.id === courseId);

        if (!course) return;

        document.getElementById("previewCourseTitle").textContent =
            course.title;

        document.getElementById("previewCourseDescription").textContent =
            course.description || "";

        const container =
            document.getElementById("previewModules");

        container.innerHTML =
            "<p style='color:rgba(255,255,255,0.4)'>Cargando...</p>";

        previewModal.classList.add("active-modal");

        const modRes =
            await fetch(
                `${API_URL}/api/modules/${course.id}`
            );

        const modules =
            await modRes.json();

        container.innerHTML =
            "";

        if (modules.length === 0) {

            container.innerHTML =
                "<p style='color:rgba(255,255,255,0.4)'>Este curso aún no tiene módulos.</p>";

            return;

        }

        for (let mi = 0; mi < modules.length; mi++) {

            const mod =
                modules[mi];

            let lessons =
                [];

            try {

                const lessRes =
                    await fetch(
                        `${API_URL}/api/lessons/${mod.id}`
                    );

                lessons =
                    await lessRes.json();

            } catch (e) {}

            let lessonsHTML =
                lessons.map((l, li) =>
                    `<li style="color:rgba(255,255,255,0.6);padding:4px 0;">${mi+1}.${li+1} ${l.title}</li>`
                ).join("");

            container.innerHTML +=
                `
                <div style="background:rgba(255,255,255,0.04);border-radius:14px;margin-bottom:12px;overflow:hidden;">
                    <div style="padding:14px 18px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:10px;"
                         onclick="this.parentElement.classList.toggle('active-preview-module');const a=this.querySelector('.preview-arrow');a.textContent=a.textContent==='▶'?'▼':'▶'">
                        <span class="preview-arrow" style="font-size:0.8rem;">▶</span>
                        Módulo ${mi+1}: ${mod.title}
                    </div>
                    <ul style="list-style:none;padding:0 18px 14px;display:block;margin:0;">
                        ${lessonsHTML || "<li style='color:rgba(255,255,255,0.3)'>Sin clases</li>"}
                    </ul>
                </div>
            `;

        }

    } catch (err) {

        document.getElementById("previewModules").innerHTML =
            "<p style='color:rgba(255,255,255,0.5)'>Error al cargar.</p>";

    }

}

/* INIT */  

loadStudentStats();

loadStudentCourses();

loadStudentAlerts();
