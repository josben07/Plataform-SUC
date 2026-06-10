const user = JSON.parse(localStorage.getItem("user"));

if (!user) {

    window.location.href =
        "../login.html";

}

const certsGrid =
    document.getElementById("certsGrid");

async function loadCertificates() {

    try {

        const [certRes, coursesRes] =
            await Promise.all([
                fetch(
                    `${API_URL}/api/certificates/${user.id}`
                ),
                fetch(
                    `${API_URL}/api/student-courses/${user.id}`
                )
            ]);

        const certs =
            await certRes.json();

        const courses =
            await coursesRes.json();

        const completedCourses =
            (courses || []).filter(
                c =>
                    c.status === "Completed"
            );

        const completedCourseIds =
            new Set(
                (certs || []).map(
                    c => c.course_id
                )
            );

        const pendingCourses =
            completedCourses.filter(
                c =>
                    !completedCourseIds.has(
                        c.course_id
                    )
            );

        if (
            !certs ||
            certs.length === 0
        ) {

            if (
                pendingCourses.length > 0
            ) {

                certsGrid.innerHTML = `
                    <div class="certs-empty">
                        <div class="certs-empty-icon"></div>
                        <h3>Certificados pendientes</h3>
                        <p>Tienes ${pendingCourses.length} curso(s) completado(s) sin certificado.</p>
                        <button class="cert-generate-btn" onclick="generatePendingCertificates()">
                            Generar certificados
                        </button>
                    </div>
                `;

            } else {

                certsGrid.innerHTML = `
                    <div class="certs-empty">
                        <div class="certs-empty-icon"></div>
                        <h3>Aún no tienes certificados</h3>
                        <p>Completa un curso para obtener tu primer certificado.</p>
                    </div>
                `;

            }

            return;

        }

        if (
            pendingCourses.length > 0
        ) {

            certsGrid.innerHTML = `
                <div class="certs-banner">
                    <p>Tienes ${pendingCourses.length} certificado(s) pendiente(s) por generar.</p>
                    <button class="cert-generate-btn" onclick="generatePendingCertificates()">
                        Generar
                    </button>
                </div>
            `;

        } else {

            certsGrid.innerHTML = "";

        }

        for (const cert of certs) {

            const date =
                new Date(
                    cert.issued_at
                );

            const formattedDate =
                date.toLocaleDateString(
                    "es-ES",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

            certsGrid.innerHTML += `
                <div class="cert-card">
                    <div class="cert-card-top">
                        <div class="cert-card-badge"></div>
                        <div class="cert-card-number">${cert.certificate_number}</div>
                    </div>
                    <h3 class="cert-card-course">${cert.course_title || "Curso"}</h3>
                    ${cert.mentor_name ? `
                        <p class="cert-card-mentor">Mentor: ${cert.mentor_name}</p>
                    ` : ""}
                    <p class="cert-card-date">Emitido el ${formattedDate}</p>
                    <a href="./certificate.html?id=${cert.id}" target="_blank" class="cert-card-btn">
                        Ver certificado →
                    </a>
                </div>
            `;

        }

    } catch (err) {

        certsGrid.innerHTML = `
            <div class="certs-empty">
                <h3>Error al cargar certificados</h3>
                <p>Intenta nuevamente más tarde.</p>
            </div>
        `;

    }

}

async function generatePendingCertificates() {

    const btn =
        document.querySelector(
            ".cert-generate-btn"
        );

    if (btn) {

        btn.disabled = true;
        btn.textContent =
            "Generando...";

    }

    try {

        const coursesRes =
            await fetch(
                `${API_URL}/api/student-courses/${user.id}`
            );

        const courses =
            await coursesRes.json();

        const completedCourses =
            (courses || []).filter(
                c =>
                    c.status === "Completed"
            );

        const certRes =
            await fetch(
                `${API_URL}/api/certificates/${user.id}`
            );

        const certs =
            await certRes.json();

        const existingCourseIds =
            new Set(
                (certs || []).map(
                    c => c.course_id
                )
            );

        const mentorRes =
            await fetch(
                `${API_URL}/api/student-mentors/${user.id}`
            );

        const mentors =
            await mentorRes.json();

        let generated = 0;

        for (const course of completedCourses) {

            if (
                existingCourseIds.has(
                    course.course_id
                )
            ) {
                continue;
            }

            const mentor =
                (mentors || []).find(
                    m =>
                        m.course_id ===
                            course.course_id &&
                        m.status === "active"
                );

            const res =
                await fetch(
                    `${API_URL}/api/certificates/generate`,
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
                                    course.course_id,
                                mentor_id:
                                    mentor
                                        ? mentor.mentor_id
                                        : null,
                                mentor_name:
                                    mentor
                                        ? mentor.mentor_name
                                        : null
                            })
                    }
                );

            if (!res.ok) {

                const err =
                    await res.json();

                alert(
                    "Error del servidor: " +
                    (err.message ||
                        err.error ||
                        JSON.stringify(
                            err
                        ))
                );

                continue;

            }

            const cert =
                await res.json();

            if (cert && cert.id) {
                generated++;
            }

        }

        if (generated > 0) {

            loadCertificates();

        } else {

            if (btn) {
                btn.disabled = false;
                btn.textContent =
                    "Generar certificados";
            }

        }

    } catch (e) {

        console.error(
            "Error generando certificados:",
            e
        );

        if (btn) {
            btn.disabled = false;
            btn.textContent =
                "Generar certificados";
        }

        alert(
            "Error al generar certificados."
        );

    }

}

loadCertificates();
