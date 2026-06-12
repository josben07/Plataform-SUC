const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!user) {

    window.location.href =
        "../login.html";

}

const list =
    document.getElementById(
        "mentorshipList"
    );

const toast =
    document.querySelector(
        ".app-toast"
    );

const toastMessage =
    document.getElementById(
        "appToastMessage"
    );

function showMsg(message) {

    if (!toast || !toastMessage) {

        return;

    }

    toastMessage.textContent =
        message;

    toast.classList.add(
        "show-toast"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show-toast"
        );

    }, 3000);

}

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

function statusLabel(status) {

    switch (status) {

        case "reserved":
            return "Reservada";
        case "completed":
            return "Completada";
        case "cancelled":
            return "Cancelada";
        case "available":
            return "Disponible";
        default:
            return status || "Sin estado";

    }

}

function statusClass(status) {

    switch (status) {

        case "reserved":
            return "status-reserved";
        case "completed":
            return "status-completed";
        case "cancelled":
            return "status-cancelled";
        default:
            return "";

    }

}

async function loadMentorships() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/mentor/student/${user.id}`
            );

        if (!response.ok) {

            renderEmpty();
            return;

        }

        const sessions =
            await response.json();

        const mySessions =
            sessions.filter(
                s =>
                    s.status === "reserved" ||
                    s.status === "completed" ||
                    s.status === "cancelled"
            );

        if (mySessions.length === 0) {

            renderEmpty();
            return;

        }

        renderList(mySessions);

    } catch (err) {

        console.error(
            "[Mis Mentorías] Error cargando historial:",
            err
        );

        renderEmpty();

    }

}

function renderEmpty() {

    list.innerHTML = `

        <div class="empty-mentorships">

            <div class="empty-icon">
                *
            </div>

            <h3>
                Aun no tienes mentorias agendadas
            </h3>

            <p>
                Ve a Mentores para agendar una sesion.
            </p>

            <a
                href="./select-mentor.html"
                class="mentorship-btn"
            >
                Ir a Mentores
            </a>

        </div>

    `;

}

function renderList(sessions) {

    list.innerHTML = `

        <div class="mentorship-table-wrap">

            <table class="mentorship-table">

                <thead>

                    <tr>
                        <th>Mentor</th>
                        <th>Curso</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>

                </thead>

                <tbody>

                    ${sessions.map(s => `

                        <tr>

                            <td class="td-mentor">
                                ${escapeHtml(s.mentor_name || "Mentor por confirmar")}
                            </td>

                            <td class="td-course">
                                ${escapeHtml(s.course_name || "Curso por confirmar")}
                            </td>

                            <td class="td-date">
                                ${escapeHtml(formatDate(s.session_date))}
                            </td>

                            <td class="td-time">
                                ${escapeHtml(formatTime(s.session_time))}
                            </td>

                            <td>
                                <span class="status-badge ${statusClass(s.status)}">
                                    ${escapeHtml(statusLabel(s.status))}
                                </span>
                            </td>

                            <td class="td-action">
                                <button
                                    class="pay-btn"
                                    disabled
                                    title="Proximamente"
                                >
                                    Pagar Mentoria
                                </button>
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}

loadMentorships();
