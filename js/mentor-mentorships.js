const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!user || user.role !== "mentor") {

    window.location.href =
        "../login.html";

}

const mentorSessionsGrid =
    document.getElementById(
        "mentorSessionsGrid"
    );

let currentSessionId = null;

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function formatDate(dateStr) {

    if (!dateStr) {

        return "Fecha por confirmar";

    }

    const d =
        new Date(`${dateStr}T00:00:00`);

    if (Number.isNaN(d.getTime())) {

        return "Fecha por confirmar";

    }

    return d.toLocaleDateString(
        "es-PE",
        {
            year:
                "numeric",
            month:
                "long",
            day:
                "numeric"
        }
    );

}

function formatTime(timeStr) {

    if (!timeStr) {

        return "Hora por confirmar";

    }

    return String(timeStr)
        .slice(0, 5);

}

function showMsg(message) {

    const toast = document.querySelector(".app-toast");
    const toastMessage = document.getElementById("appToastMessage");
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("show-toast");
    setTimeout(() => {
        toast.classList.remove("show-toast");
    }, 3000);

}

async function getCompletionStatus(sessionId) {

    try {

        const res = await fetch(`${API_URL}/api/mentorship/status/${sessionId}`);
        if (!res.ok) return null;
        return await res.json();

    } catch {

        return null;

    }

}

async function loadMentorSessions() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/mentor/sessions/${user.id}`
            );

        if (!response.ok) {

            throw new Error(
                `Error ${response.status}`
            );

        }

        const sessions =
            await response.json();

        const mentorSessions =
            sessions.filter(
                session => session.status !== "available"
            );

        mentorSessionsGrid.innerHTML =
            "";

        if (mentorSessions.length === 0) {

            mentorSessionsGrid.innerHTML = `

                <div class="empty-state">
                    <h3>No tienes mentorias</h3>
                    <p>Cuando un alumno solicite una mentoria, aparecera aqui.</p>
                </div>

            `;

            return;

        }

        const statusMap = {};
        await Promise.all(mentorSessions.map(async (s) => {
            statusMap[s.id] = await getCompletionStatus(s.id);
        }));

        mentorSessionsGrid.innerHTML =
            mentorSessions.map(session => {

                const st = statusMap[session.id];
                const mentorConfirmed = st?.mentor_confirmed === true;
                const bothDone = st?.completed === true;

                let statusHtml = session.status === "confirmed"
                    ? `<div class="session-status" style="background:rgba(108,77,255,.14);color:#8B7CFF">Confirmada</div>`
                    : session.status === "completed"
                    ? `<div class="session-status" style="background:rgba(34,197,94,.14);color:#22C55E">Completada</div>`
                    : `<div class="session-status reserved">Reservada</div>`;

                let actionHtml = "";

                if (bothDone) {

                    statusHtml = `
                        <div class="session-status" style="background:rgba(34,197,94,.14);color:#22C55E">
                            Completada
                        </div>
                    `;

                } else if (mentorConfirmed) {

                    statusHtml = `
                        <div class="session-status" style="background:rgba(245,158,11,.14);color:#F59E0B">
                            Esperando alumno
                        </div>
                    `;
                    actionHtml = `
                        <div class="completion-status">
                            <span class="done">✔ Tú confirmaste</span>
                            <span class="pending">⏳ Esperando al alumno</span>
                        </div>
                    `;

                } else {

                    const studentId = session.student_id || "";
                    const courseId = session.course_id || "";
                    actionHtml = `
                        <button class="complete-btn" onclick="openMentorCompleteModal('${session.id}', '${studentId}', '${courseId}')">
                            Completar mentoría
                        </button>
                    `;

                }

                return `

                <div class="session-card">

                    <h3>${escapeHtml(session.session_title || "Mentoria agendada")}</h3>

                    <p>Mentor: ${escapeHtml(session.mentor_name || "Mentor")}</p>

                    <p>Alumno: ${escapeHtml(session.student_name || "Alumno por confirmar")}</p>

                    <p>Fecha: ${escapeHtml(formatDate(session.session_date))}</p>

                    <p>Hora: ${escapeHtml(formatTime(session.session_time))}</p>

                    ${statusHtml}

                    ${session.meet_link && session.status !== "completed"
                        ? `
                            <a
                                href="${escapeHtml(session.meet_link)}"
                                target="_blank"
                                class="meet-btn"
                            >
                                Entrar a reunion
                            </a>
                        `
                        : ""
                    }

                    ${actionHtml}

                </div>

            `;

            }).join("");

    } catch (err) {

        console.error(
            "[Mentorías Mentor] Error cargando sesiones:",
            err
        );

        mentorSessionsGrid.innerHTML = `

            <div class="empty-state">
                <h3>No se pudieron cargar tus mentorias</h3>
                <p>Intenta actualizar la pagina.</p>
            </div>

        `;

    }

}

/* MODAL MENTOR */

async function openMentorCompleteModal(sessionId, studentId, courseId) {

    currentSessionId = sessionId;
    document.getElementById("mentorEvidenceFile").value = "";
    document.querySelector('input[name="mentor_done"][value="si"]').checked = true;
    document.querySelector('input[name="mentor_approve_project"][value="no"]').checked = true;
    document.querySelector('input[name="mentor_more"][value="no"]').checked = true;

    if (studentId && courseId) {

        try {

            const res = await fetch(`${API_URL}/api/projects`);
            if (res.ok) {

                const projects = await res.json();
                const studentProjects = projects.filter(
                    p => p.user_id === studentId &&
                         p.course_id === courseId &&
                         p.submission_type === "final_project"
                );
                const approved = studentProjects.some(p => p.status === "approved");
                if (approved) {

                    document.querySelector('input[name="mentor_approve_project"][value="si"]').checked = true;

                }

            }

        } catch (e) {

            console.warn("[openMentorCompleteModal] Error al obtener proyecto:", e);

        }

    }

    document.getElementById("mentorCompleteModal").classList.add("active");

}

function closeMentorCompleteModal() {

    document.getElementById("mentorCompleteModal").classList.remove("active");
    currentSessionId = null;

}

async function submitMentorComplete() {

    if (!currentSessionId) return;

    const seRealizo = document.querySelector('input[name="mentor_done"]:checked')?.value;
    if (seRealizo !== "si") {
        showMsg("Debes confirmar que la mentoría se realizó.");
        return;
    }

    const submitBtn = document.getElementById("mentorCompleteSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {

        const evidenceFile = document.getElementById("mentorEvidenceFile").files[0];
        let evidenceUrl = null;

        if (evidenceFile) {

            const formData = new FormData();
            formData.append("file", evidenceFile);

            const uploadRes = await fetch(`${API_URL}/api/uploads/mentorships`, {
                method: "POST",
                body: formData
            });

            if (uploadRes.ok) {

                const uploadData = await uploadRes.json();
                evidenceUrl = uploadData.url;

            }

        }

        const mentorApproved = document.querySelector('input[name="mentor_approve_project"]:checked')?.value === "si";
        const mentorWantsMore = document.querySelector('input[name="mentor_more"]:checked')?.value === "si";

        const res = await fetch(`${API_URL}/api/mentorship/mentor-complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: currentSessionId,
                mentor_id: user.id,
                mentor_approved_project: mentorApproved,
                mentor_wants_more: mentorWantsMore,
                evidence_url: evidenceUrl
            })
        });

        if (!res.ok) {

            const errData = await res.json();
            throw new Error(errData.error || "Error al guardar");

        }

        showMsg("Mentoría completada correctamente.");
        closeMentorCompleteModal();
        loadMentorSessions();

    } catch (err) {

        console.error("[submitMentorComplete]", err);
        showMsg("Error: " + err.message);

    } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = "Confirmar";

    }

}

loadMentorSessions();
