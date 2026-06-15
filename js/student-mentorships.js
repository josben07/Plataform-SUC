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

let currentSessionId = null;
let selectedStars = 0;

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
        case "confirmed":
            return "Confirmada";
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
        case "confirmed":
            return "status-confirmed";
        case "completed":
            return "status-completed";
        case "cancelled":
            return "status-cancelled";
        default:
            return "";

    }

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
                    s.status === "confirmed" ||
                    s.status === "completed" ||
                    s.status === "cancelled"
            );

        if (mySessions.length === 0) {

            renderEmpty();
            return;

        }

        const statusMap = {};
        try {
            await Promise.all(mySessions.map(async (s) => {
                if (s.status === "reserved") {
                    statusMap[s.id] = await getCompletionStatus(s.id);
                }
            }));
        } catch (e) {
            console.warn("[statusMap] Error cargando estados:", e);
        }

        renderList(mySessions, statusMap);

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

function renderList(sessions, statusMap) {

    const rows = [];

    for (let i = 0; i < sessions.length; i++) {

        const s = sessions[i];

        const st = statusMap?.[s.id];
        const studentConfirmed = st?.student_confirmed === true;
        const bothDone = st?.completed === true;

        let actionHtml = "";

        if (s.status === "reserved" && bothDone) {

            actionHtml = '<span style="color:#22C55E;font-weight:700;font-size:.85rem">✔ Completada</span>';

        } else if (s.status === "reserved" && studentConfirmed) {

            actionHtml = '<span style="color:#F59E0B;font-weight:700;font-size:.85rem">⏳ Esperando al mentor</span>';

        } else if (s.status === "confirmed") {

            actionHtml = '<button class="complete-mentorship-btn" onclick="openStudentCompleteModal(\'' + s.id + '\')">Confirmar mentoría</button>';

        } else if (s.status === "reserved") {

            const paymentStatus = st?.payment_status;
            if (paymentStatus === "aprobado") {

                actionHtml = '<button class="complete-mentorship-btn" onclick="openStudentCompleteModal(\'' + s.id + '\')">Confirmar mentoría</button>';

            } else if (paymentStatus === "en_revision") {

                actionHtml = '<span style="color:#F59E0B;font-weight:700;font-size:.85rem">⏳ Comprobante enviado</span>';

            } else {

                actionHtml = '<a href="./payments.html" class="pay-btn" style="margin-right:8px">Ir a Pagar</a>' +
                    '<button class="cancel-mentorship-btn" onclick="cancelStudentMentorship(\'' + s.id + '\')">Cancelar</button>';

            }

        }

        const priceHtml = (s.price != null && s.price != "")
            ? "S/ " + Number(s.price).toFixed(2)
            : "Por definir";

        rows.push("<tr>");
        rows.push('<td class="td-mentor">' + escapeHtml(s.mentor_name || "Mentor por confirmar") + "</td>");
        rows.push('<td class="td-course">' + escapeHtml(s.course_name || "Curso por confirmar") + "</td>");
        rows.push('<td class="td-price">' + priceHtml + "</td>");
        rows.push('<td class="td-date">' + escapeHtml(formatDate(s.session_date)) + "</td>");
        rows.push('<td class="td-time">' + escapeHtml(formatTime(s.session_time)) + "</td>");
        rows.push('<td><span class="status-badge ' + statusClass(s.status) + '">' + escapeHtml(statusLabel(s.status)) + "</span></td>");
        if (
            s.meet_link &&
            (s.status === "confirmed" || (s.status === "reserved" && st?.payment_status === "aprobado"))
        ) {

            rows.push('<td class="td-action td-action-split"><a href="' + escapeHtml(s.meet_link) + '" target="_blank" class="join-meet-btn">Entrar a reunión</a><span class="action-group">' + actionHtml + '</span></td>');

        } else {

            rows.push('<td class="td-action">' + actionHtml + "</td>");

        }
        rows.push("</tr>");

    }

    list.innerHTML =
        '<div class="mentorship-table-wrap">' +
            '<table class="mentorship-table">' +
                "<thead><tr>" +
                    "<th>Mentor</th>" +
                    "<th>Curso</th>" +
                    "<th>Precio</th>" +
                    "<th>Fecha</th>" +
                    "<th>Hora</th>" +
                    "<th>Estado</th>" +
                    "<th></th>" +
                "</tr></thead>" +
                "<tbody>" +
                    rows.join("") +
                "</tbody>" +
            "</table>" +
        "</div>";

}

/* MODAL ALUMNO */

function openStudentCompleteModal(sessionId) {

    currentSessionId = sessionId;
    document.getElementById("studentEvidenceFile").value = "";
    document.querySelector('input[name="student_done"][value="si"]').checked = true;
    document.querySelector('input[name="student_more"][value="no"]').checked = true;
    document.getElementById("studentComments").value = "";
    selectedStars = 0;
    document.querySelectorAll("#studentStarGroup .star").forEach(el => el.classList.remove("active"));
    document.getElementById("studentCompleteModal").classList.add("active");

}

function closeStudentCompleteModal() {

    document.getElementById("studentCompleteModal").classList.remove("active");
    currentSessionId = null;

}

function initStarRating() {

    const stars = document.querySelectorAll("#studentStarGroup .star");
    stars.forEach(star => {

        star.addEventListener("click", function () {

            selectedStars = Number(this.dataset.value);
            stars.forEach(s => {
                s.classList.toggle("active", Number(s.dataset.value) <= selectedStars);
            });

        });

        star.addEventListener("mouseenter", function () {

            const val = Number(this.dataset.value);
            stars.forEach(s => {
                s.classList.toggle("active", Number(s.dataset.value) <= val);
            });

        });

        star.addEventListener("mouseleave", function () {

            stars.forEach(s => {
                s.classList.toggle("active", Number(s.dataset.value) <= selectedStars);
            });

        });

    });

}

async function submitStudentComplete() {

    if (!currentSessionId) return;

    const seRealizo =
        document.querySelector('input[name="student_done"]:checked')?.value;

    if (seRealizo !== "si") {

        showMsg("Solo puedes confirmar una mentoría que sí se realizó.");
        return;

    }

    const submitBtn = document.getElementById("studentCompleteSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {

        const evidenceFile = document.getElementById("studentEvidenceFile").files[0];
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

        const studentWantsMore = document.querySelector('input[name="student_more"]:checked')?.value === "si";
        const studentComments = document.getElementById("studentComments").value.trim();

        const res = await fetch(`${API_URL}/api/mentorship/student-complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: currentSessionId,
                student_id: user.id,
                student_wants_more: studentWantsMore,
                student_rating: selectedStars || null,
                student_comments: studentComments || null,
                evidence_url: evidenceUrl
            })
        });

        if (!res.ok) {

            const errData = await res.json();
            throw new Error(errData.error || "Error al guardar");

        }

        showMsg("Mentoría confirmada correctamente.");
        closeStudentCompleteModal();
        loadMentorships();

    } catch (err) {

        console.error("[submitStudentComplete]", err);
        showMsg("Error: " + err.message);

    } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = "Confirmar";

    }

}

function cancelStudentMentorship(sessionId) {

    document.getElementById("studentCancelModal").classList.add("active");
    document.getElementById("studentCancelConfirmBtn").dataset.sessionId = sessionId;

}

function closeCancelModal() {

    document.getElementById("studentCancelModal").classList.remove("active");

}

async function confirmCancelMentorship() {

    const sessionId = document.getElementById("studentCancelConfirmBtn").dataset.sessionId;
    if (!sessionId) return;

    const btn = document.getElementById("studentCancelConfirmBtn");
    btn.disabled = true;
    btn.textContent = "Cancelando...";

    try {

        const res = await fetch(
            `${API_URL}/api/mentor/cancel/${sessionId}`,
            { method: "PUT" }
        );

        if (!res.ok) {

            const err = await res.json();
            throw new Error(err.error || "No se pudo cancelar la mentoría.");

        }

        closeCancelModal();
        showMsg("Mentoría cancelada correctamente.");
        loadMentorships();

    } catch (err) {

        console.error("[confirmCancelMentorship]", err);
        showMsg("Error: " + err.message);
        closeCancelModal();

    } finally {

        btn.disabled = false;
        btn.textContent = "Sí, cancelar";

    }

}

closeStudentCompleteModal();
initStarRating();
loadMentorships();
