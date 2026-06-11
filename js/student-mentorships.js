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

function formatDate(dateStr) {

    if (!dateStr) {

        return "—";

    }

    try {

        const d =
            new Date(dateStr);

        return d.toLocaleDateString(
            "es-PE",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    } catch {

        return dateStr;

    }

}

function formatTime(timeStr) {

    if (!timeStr) {

        return "—";

    }

    return timeStr;

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
            return status ||
                "—";

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
                    s.status ===
                        "reserved" ||
                    s.status ===
                        "completed" ||
                    s.status ===
                        "cancelled"
            );

        if (
            mySessions.length === 0
        ) {

            renderEmpty();
            return;

        }

        renderList(mySessions);

    } catch {

        renderEmpty();

    }

}

function renderEmpty() {

    list.innerHTML = `

        <div class="empty-mentorships">

            <div class="empty-icon">
                🎓
            </div>

            <h3>
                Aún no tienes mentorías agendadas
            </h3>

            <p>
                Ve a Mentores para agendar una sesión.
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
                                ${s.mentor_name || "—"}
                            </td>

                            <td class="td-course">
                                —
                            </td>

                            <td class="td-date">
                                ${formatDate(s.session_date)}
                            </td>

                            <td class="td-time">
                                ${formatTime(s.session_time)}
                            </td>

                            <td>
                                <span class="status-badge ${statusClass(s.status)}">
                                    ${statusLabel(s.status)}
                                </span>
                            </td>

                            <td class="td-action">
                                <button
                                    class="pay-btn"
                                    disabled
                                    title="Próximamente"
                                >
                                    Pagar Mentoría
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