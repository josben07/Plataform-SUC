const token =
    localStorage.getItem("token");

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!token || !user || user.role !== "admin") {

    window.location.href =
        "../login.html";

}

const adminToast =
    document.querySelector(".admin-toast");

const adminToastMessage =
    document.getElementById("adminToastMessage");

const mentorGrid =
    document.getElementById("mentorGrid");

const mentorSummary =
    document.getElementById("mentorSummary");

const TRACKED_STATUSES =
    [
        "reserved",
        "confirmed",
        "completed",
        "cancelled"
    ];

const STATUS_META =
    {
        reserved: {
            label:
                "Reservada",
            detail:
                "Pago pendiente",
            section:
                "Reservas pendientes de pago",
            className:
                "status-reserved"
        },
        confirmed: {
            label:
                "Confirmada",
            detail:
                "Pago aprobado",
            section:
                "Mentor&iacute;as confirmadas",
            className:
                "status-confirmed"
        },
        completed: {
            label:
                "Completada",
            detail:
                "Mentor&iacute;a finalizada",
            section:
                "Historial finalizado",
            className:
                "status-completed"
        },
        cancelled: {
            label:
                "Cancelada",
            detail:
                "Reserva cancelada",
            section:
                "Historial cancelado",
            className:
                "status-cancelled"
        }
    };

function showAdminToast(message) {

    if (!adminToast || !adminToastMessage) return;

    adminToastMessage.textContent =
        message;

    adminToast.classList.add("show-toast");

    setTimeout(() => {
        adminToast.classList.remove("show-toast");
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

function formatMentorshipPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {

        return "Por definir";

    }

    const numericPrice =
        Number(price);

    return Number.isFinite(numericPrice) &&
        numericPrice >= 0
        ? `S/ ${numericPrice.toFixed(2)}`
        : "Por definir";

}

function formatDate(dateValue) {

    if (!dateValue) {

        return "Sin fecha";

    }

    const [year, month, day] =
        String(dateValue).split("-");

    if (!year || !month || !day) {

        return escapeHtml(dateValue);

    }

    return `${day}/${month}/${year}`;

}

function formatTime(timeValue) {

    if (!timeValue) {

        return "Sin hora";

    }

    return String(timeValue).slice(0, 5);

}

function getSafeUrl(url) {

    try {

        const parsedUrl =
            new URL(
                url,
                window.location.origin
            );

        return parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
            ? parsedUrl.href
            : null;

    } catch (error) {

        return null;

    }

}

function getStatusMeta(status) {

    return STATUS_META[status] || {
        label:
            "Sin estado",
        detail:
            "No clasificada",
        section:
            "Otras mentor&iacute;as",
        className:
            "status-unknown"
    };

}

function renderSummary(sessions) {

    const counts =
        TRACKED_STATUSES.reduce((acc, status) => {

            acc[status] =
                sessions.filter(
                    session => session.status === status
                ).length;

            return acc;

        }, {});

    mentorSummary.innerHTML =
        TRACKED_STATUSES
            .map(status => {

                const meta =
                    getStatusMeta(status);

                return `
                    <div class="mentor-summary-card ${meta.className}">
                        <span>${meta.label}</span>
                        <strong>${counts[status]}</strong>
                        <small>${meta.detail}</small>
                    </div>
                `;

            })
            .join("");

}

function renderEmptyState() {

    mentorGrid.innerHTML =
        `
            <div class="empty-state">
                <div class="empty-icon">
                    &#127891;
                </div>
                <h3>
                    No hay reservas de mentor&iacute;a
                </h3>
                <p>
                    Cuando un alumno agende una mentor&iacute;a, aparecer&aacute; en este seguimiento.
                </p>
            </div>
        `;

}

function renderSessionCard(session) {

    const meta =
        getStatusMeta(session.status);

    const title =
        escapeHtml(
            session.session_title ||
            "Mentoria agendada"
        );

    const mentorName =
        escapeHtml(
            session.mentor_name ||
            "Mentor no asignado"
        );

    const studentName =
        escapeHtml(
            session.student_name ||
            "Alumno no registrado"
        );

    const courseName =
        escapeHtml(
            session.course_name ||
            ""
        );

    const safeMeetLink =
        session.meet_link
            ? getSafeUrl(session.meet_link)
            : null;

    const meetLink =
        safeMeetLink
            ? `
                <a
                    class="mentor-link"
                    href="${escapeHtml(safeMeetLink)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Abrir reuni&oacute;n
                </a>
            `
            : "";

    return `
        <article class="mentor-card history-card">
            <div class="mentor-card-header">
                <h3>${title}</h3>
                <div class="mentor-status ${meta.className}">
                    ${meta.label}
                </div>
            </div>

            <div class="mentor-card-details">
                <p>
                    <span>Mentor</span>
                    ${mentorName}
                </p>
                <p>
                    <span>Alumno</span>
                    ${studentName}
                </p>
                ${courseName
                    ? `
                        <p>
                            <span>Curso</span>
                            ${courseName}
                        </p>
                    `
                    : ""}
                <p>
                    <span>Fecha</span>
                    ${formatDate(session.session_date)}
                </p>
                <p>
                    <span>Hora</span>
                    ${formatTime(session.session_time)}
                </p>
                <p class="mentor-price">
                    <span>Precio</span>
                    ${formatMentorshipPrice(session.price)}
                </p>
            </div>

            ${meetLink}
        </article>
    `;

}

function renderSection(title, sessions) {

    if (sessions.length === 0) {

        return "";

    }

    return `
        <div class="history-header">
            <h3>${title}</h3>
            <span>${sessions.length}</span>
        </div>
        ${sessions.map(renderSessionCard).join("")}
    `;

}

function renderMentorships(sessions) {

    const trackedSessions =
        sessions.filter(session =>
            TRACKED_STATUSES.includes(session.status)
        );

    renderSummary(trackedSessions);

    if (trackedSessions.length === 0) {

        renderEmptyState();
        return;

    }

    mentorGrid.innerHTML =
        [
            renderSection(
                STATUS_META.reserved.section,
                trackedSessions.filter(
                    session => session.status === "reserved"
                )
            ),
            renderSection(
                STATUS_META.confirmed.section,
                trackedSessions.filter(
                    session => session.status === "confirmed"
                )
            ),
            renderSection(
                STATUS_META.completed.section,
                trackedSessions.filter(
                    session => session.status === "completed"
                )
            ),
            renderSection(
                STATUS_META.cancelled.section,
                trackedSessions.filter(
                    session => session.status === "cancelled"
                )
            )
        ].join("");

}

async function loadMentorships() {

    try {

        mentorGrid.innerHTML =
            `
                <div class="empty-state">
                    <p>Cargando mentor&iacute;as...</p>
                </div>
            `;

        const response =
            await fetch(`${API_URL}/api/mentor`);

        const sessions =
            await response.json();

        if (!response.ok || !Array.isArray(sessions)) {

            throw new Error("No se pudieron cargar las mentorias");

        }

        renderMentorships(sessions);

    } catch (error) {

        console.error("[Admin mentorias] Error:", error);

        showAdminToast(
            "No se pudieron cargar las mentorias"
        );

        mentorSummary.innerHTML =
            "";

        mentorGrid.innerHTML =
            `
                <div class="empty-state">
                    <div class="empty-icon">
                        !
                    </div>
                    <h3>Error al cargar mentor&iacute;as</h3>
                    <p>Intenta recargar la pagina.</p>
                </div>
            `;

    }

}

loadMentorships();
