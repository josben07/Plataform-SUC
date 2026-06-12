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

        const reservedSessions =
            sessions.filter(
                session =>
                    session.status === "reserved"
            );

        mentorSessionsGrid.innerHTML =
            "";

        if (reservedSessions.length === 0) {

            mentorSessionsGrid.innerHTML = `

                <div class="empty-state">
                    <h3>No tienes mentorias reservadas</h3>
                    <p>Cuando un alumno solicite una mentoria, aparecera aqui.</p>
                </div>

            `;

            return;

        }

        mentorSessionsGrid.innerHTML =
            reservedSessions.map(session => `

                <div class="session-card">

                    <h3>${escapeHtml(session.session_title || "Mentoria agendada")}</h3>

                    <p>Mentor: ${escapeHtml(session.mentor_name || "Mentor")}</p>

                    <p>Alumno: ${escapeHtml(session.student_name || "Alumno por confirmar")}</p>

                    <p>Fecha: ${escapeHtml(formatDate(session.session_date))}</p>

                    <p>Hora: ${escapeHtml(formatTime(session.session_time))}</p>

                    <div class="session-status reserved">
                        Reservada
                    </div>

                    ${session.meet_link
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

                </div>

            `).join("");

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

loadMentorSessions();
