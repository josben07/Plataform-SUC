const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!user) {

    window.location.href =
        "../login.html";

}

const params =
    new URLSearchParams(
        window.location.search
    );

let courseId =
    params.get("courseId");

if (!courseId) {

    courseId =
        localStorage.getItem(
            "currentCourseId"
        );

}



const mentorsGrid =
    document.getElementById(
        "studentMentorsGrid"
    );

const searchInput =
    document.getElementById(
        "mentorSearch"
    );

const modal =
    document.querySelector(
        ".mentor-modal"
    );

const closeModal =
    document.querySelector(
        ".close-modal"
    );

const modalImage =
    document.getElementById(
        "modalImage"
    );

const modalName =
    document.getElementById(
        "modalName"
    );

const modalRole =
    document.getElementById(
        "modalRole"
    );

const modalDescription =
    document.getElementById(
        "modalDescription"
    );

const modalExperience =
    document.getElementById(
        "modalExperience"
    );

const modalCompany =
    document.getElementById(
        "modalCompany"
    );

const modalPrice =
    document.getElementById(
        "modalPrice"
    );

const modalTags =
    document.getElementById(
        "modalTags"
    );

const modalSelectBtn =
    document.getElementById(
        "modalSelectBtn"
    );

const appToast =
    document.querySelector(
        ".app-toast"
    );

const appToastMessage =
    document.getElementById(
        "appToastMessage"
    );

let selectedMentorId =
    null;

let mentorsData =
    [];

let courseMentorIds =
    [];

const DEFAULT_AVATAR =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%236C4DFF'/%3E%3Ccircle cx='50' cy='34' r='16' fill='white'/%3E%3Cellipse cx='50' cy='72' rx='30' ry='22' fill='white'/%3E%3C/svg%3E";

const CALENDLY_FALLBACK =
    "https://calendly.com/jossvasquezcu-uch/30min";

const CALENDLY_WIDGET_SCRIPT =
    "https://assets.calendly.com/assets/external/widget.js";

let calendlyContext =
    null;

let calendlyBookingInProgress =
    false;

let calendlyWidgetScriptPromise =
    null;

/* LOAD COURSE MENTOR ASSIGNMENTS */

async function loadCourseMentors() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/course-mentors`
            );

        if (!response.ok) {

            return;

        }

        const assignments =
            await response.json();

        courseMentorIds =
            assignments
                .filter(item =>
                    String(item.course_id) === String(courseId)
                )
                .map(item =>
                    item.mentor_id
                );

    } catch (err) {

        /* table might not exist yet */

    }

}

function showToast(message) {

    if (!appToast || !appToastMessage) return;

    appToastMessage.textContent =
        message;

    appToast.classList.add(
        "show-toast"
    );

    setTimeout(() => {

        appToast.classList.remove(
            "show-toast"
        );

    }, 3000);

}

/* FILTERS */

function setActiveFilter(btn) {
    document.querySelectorAll(".mentor-filter").forEach(b => b.classList.remove("active-filter"));
    if (btn) btn.classList.add("active-filter");
}

function showAllMentors() {
    setActiveFilter(event.target);
    renderMentors(mentorsData);
}

function showCourseMentors() {
    setActiveFilter(event.target);
    const filtered = mentorsData.filter(m =>
        courseMentorIds.some(id =>
            String(id) === String(m.id)
        )
    );
    renderMentors(filtered);
}

/* LOAD MENTORS */

async function loadMentors() {

    await loadCourseMentors();

    const response =
        await fetch(
            `${API_URL}/api/mentor-profiles`
        );

    const mentors =
        await response.json();

    mentorsData =
        mentors;

    renderMentors(
        mentorsData
    );

}

/* RENDER */

function renderMentors(mentors) {

    mentorsGrid.innerHTML =
        "";

    if (mentors.length === 0) {

        mentorsGrid.innerHTML = `

            <div class="empty-mentors" style="display:block;">

                <h3>
                    No se encontraron mentores
                </h3>

                <p>
                    Prueba con otro nombre, cargo o especialidad.
                </p>

            </div>

        `;

        return;

    }

    mentors.forEach(mentor => {

        const profile =
            mentor.profile || {};

        const isCourseMentor =
            courseId
                ? courseMentorIds.some(id =>
                    String(id) === String(mentor.id)
                )
                : true;

        const cardClass =
            isCourseMentor
                ? "mentor-card course-mentor-card"
                : "mentor-card";

        const badgeHtml =
            isCourseMentor && courseId
                ? `<div class="course-badge">Mentor de este curso</div>`
                : "";

        mentorsGrid.innerHTML += `

            <div class="${cardClass}">

                ${badgeHtml}

                <div class="mentor-image">

                    <img
                        src="${profile.photo_url ||
            DEFAULT_AVATAR
            }"
                    >

                </div>

                <div class="mentor-info">

                    <div class="mentor-top">

                        <div>

                            <h3>
                                ${mentor.full_name}
                            </h3>

                            <span>
                                ${profile.position ||
            "Mentor"
            }
                            </span>

                        </div>

                    </div>

                    <p class="mentor-description">

                        ${profile.description ||
            "Sin descripción profesional."
            }

                    </p>

                    <div class="mentor-tags">

                        <span>
                            ${profile.company ||
            "Empresa"
            }
                        </span>

                        <span>
                            ${profile.experience_years || 0
            }
                            años
                        </span>

                    </div>

                    <div class="mentor-price-display" style="margin-top:10px;">
                        <span>Precio base:</span>
                        $${profile.base_price ? parseFloat(profile.base_price).toFixed(2) : "0.00"}
                    </div>

                    <div class="mentor-footer">

                        <button
                            class="mentor-btn"
                            onclick="openMentorProfile('${mentor.id}')"
                        >
                            Ver Perfil
                        </button>

                        <button
                            class="mentor-btn mentor-btn-secondary"
                            onclick="openCalendly('${mentor.id}')"
                        >
                            Agendar Mentoría
                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}

/* SEARCH */

searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value
                .toLowerCase()
                .trim();

        const filteredMentors =
            mentorsData.filter(mentor => {

                const profile =
                    mentor.profile || {};

                return (

                    mentor.full_name
                        .toLowerCase()
                        .includes(value)

                    ||

                    (profile.position || "")
                        .toLowerCase()
                        .includes(value)

                    ||

                    (profile.company || "")
                        .toLowerCase()
                        .includes(value)

                    ||

                    (profile.specialties || "")
                        .toLowerCase()
                        .includes(value)

                );

            });

        renderMentors(
            filteredMentors
        );

    }
);

/* OPEN PROFILE */

function openMentorProfile(mentorId) {

    const mentor =
        mentorsData.find(
            item =>
                item.id === mentorId
        );

    if (!mentor) {

        return;

    }

    selectedMentorId =
        mentor.id;

    const profile =
        mentor.profile || {};

    modalImage.src =
        profile.photo_url ||
        "../../assets/default-avatar.png";

    modalName.textContent =
        mentor.full_name;

    modalRole.textContent =
        profile.position ||
        "Mentor";

    modalDescription.textContent =
        profile.description ||
        "Sin descripción.";

    modalExperience.textContent =
        `${profile.experience_years || 0} años`;

    modalCompany.textContent =
        profile.company ||
        "Empresa";

    const isCourseMentor =
        courseId
            ? courseMentorIds.some(id =>
                String(id) === String(mentor.id)
            )
            : true;

    modalPrice.textContent =
        `$${profile.base_price ? parseFloat(profile.base_price).toFixed(2) : "0.00"}`;

    modalSelectBtn.textContent =
        isCourseMentor
            ? "Agendar mentoría"
            : "No disponible para este curso";

    modalSelectBtn.disabled =
        !isCourseMentor;

    modalSelectBtn.style.opacity =
        isCourseMentor ? "1" : "0.45";

    modalSelectBtn.style.cursor =
        isCourseMentor ? "pointer" : "not-allowed";

    modalTags.innerHTML =
        "";

    if (profile.specialties) {

        profile.specialties
            .split(",")
            .forEach(tag => {

                modalTags.innerHTML += `

                <span>
                    ${tag.trim()}
                </span>

            `;

            });

    }

    modal.classList.add(
        "active-modal"
    );

}

/* CALENDLY */

function getCalendlyEmbedUrl() {

    const params =
        "hide_landing_page_details=1&hide_gdpr_banner=1";

    return `${CALENDLY_FALLBACK}?${params}`;

}

function loadCalendlyWidget() {

    if (
        window.Calendly &&
        typeof window.Calendly.initInlineWidget ===
            "function"
    ) {

        return Promise.resolve();

    }

    if (calendlyWidgetScriptPromise) {

        return calendlyWidgetScriptPromise;

    }

    calendlyWidgetScriptPromise =
        new Promise((resolve, reject) => {

            const existingScript =
                document.querySelector(
                    `script[src="${CALENDLY_WIDGET_SCRIPT}"]`
                );

            const onLoad =
                () => resolve();

            const onError =
                () => reject(
                    new Error(
                        "No se pudo cargar el widget oficial de Calendly."
                    )
                );

            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    onLoad,
                    {
                        once:
                            true
                    }
                );

                existingScript.addEventListener(
                    "error",
                    onError,
                    {
                        once:
                            true
                    }
                );

                return;

            }

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                CALENDLY_WIDGET_SCRIPT;

            script.async =
                true;

            script.addEventListener(
                "load",
                onLoad,
                {
                    once:
                        true
                }
            );

            script.addEventListener(
                "error",
                onError,
                {
                    once:
                        true
                }
            );

            document.head.appendChild(
                script
            );

        });

    return calendlyWidgetScriptPromise;

}

async function openCalendly(mentorId) {

    const mentor =
        mentorsData.find(
            m =>
                String(m.id) === String(mentorId)
        );

    if (!mentor) {

        showToast(
            "No se encontró el mentor."
        );

        return;

    }

    const isCourseMentor =
        courseId
            ? courseMentorIds.some(id =>
                String(id) === String(mentor.id)
            )
            : true;

    if (!isCourseMentor) {

        showToast(
            "Este mentor no está asignado a tu curso."
        );

        return;

    }

    const container =
        document.getElementById(
            "calendlyContainer"
        );

    container.innerHTML =
        "";

    modal.classList.remove(
        "active-modal"
    );

    calendlyContext = {
        mentorId:
            String(mentor.id),
        courseId:
            courseId || null
    };

    calendlyBookingInProgress =
        false;

    document
        .getElementById(
            "calendlyModal"
        )
        .classList.add(
            "active-modal"
        );

    try {

        await loadCalendlyWidget();

        window.Calendly.initInlineWidget({
            url:
                getCalendlyEmbedUrl(),
            parentElement:
                container
        });

    } catch (err) {

        console.error(
            "[Calendly] Error inicializando widget oficial:",
            err
        );

        showToast(
            "No se pudo abrir Calendly."
        );

        closeCalendly();

    }

}

function closeCalendly() {

    document
        .getElementById(
            "calendlyModal"
        )
        .classList.remove(
            "active-modal"
        );

    const container =
        document.getElementById(
            "calendlyContainer"
        );

    container.innerHTML =
        "";

    calendlyContext =
        null;

    calendlyBookingInProgress =
        false;

}

function getCalendlyStartTime(payload) {

    const candidates = [
        payload &&
            payload.event &&
            payload.event.start_time,
        payload &&
            payload.event &&
            payload.event.startTime,
        payload &&
            payload.scheduled_event &&
            payload.scheduled_event.start_time,
        payload &&
            payload.scheduledEvent &&
            payload.scheduledEvent.startTime,
        payload &&
            payload.start_time,
        payload &&
            payload.startTime
    ];

    return candidates.find(Boolean) || null;

}

function getCalendlyTimezone(payload) {

    const candidates = [
        payload &&
            payload.event &&
            payload.event.timezone,
        payload &&
            payload.event &&
            payload.event.event_timezone,
        payload &&
            payload.invitee &&
            payload.invitee.timezone,
        payload &&
            payload.invitee &&
            payload.invitee.invitee_timezone,
        payload &&
            payload.timezone
    ];

    return candidates.find(Boolean) || null;

}

function getCalendlySchedule(payload) {

    const startTime =
        getCalendlyStartTime(payload);

    if (!startTime) {

        return {
            session_date:
                null,
            session_time:
                null
        };

    }

    const date =
        new Date(startTime);

    if (Number.isNaN(date.getTime())) {

        return {
            session_date:
                null,
            session_time:
                null
        };

    }

    return {
        session_date:
            date.toISOString().slice(0, 10),
        session_time:
            date.toLocaleTimeString(
                "es-PE",
                {
                    hour:
                        "2-digit",
                    minute:
                        "2-digit"
                }
            )
    };

}

/* BOOK MENTORSHIP (shared) */

async function bookMentorshipDb(
    mentorId,
    courseId,
    calendlyPayload = {}
) {

    try {

        const calendlySchedule =
            getCalendlySchedule(
                calendlyPayload
            );

        if (calendlyBookingInProgress) {

            return false;

        }

        calendlyBookingInProgress =
            true;

        const response =
            await fetch(
                `${API_URL}/api/mentor/book`,
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
                            mentor_id:
                                mentorId,
                            course_id:
                                courseId ||
                                null,
                            calendly_event_uri:
                                calendlyPayload.event &&
                                calendlyPayload.event.uri
                                    ? calendlyPayload.event.uri
                                    : null,
                            calendly_invitee_uri:
                                calendlyPayload.invitee &&
                                calendlyPayload.invitee.uri
                                    ? calendlyPayload.invitee.uri
                                    : null,
                            calendly_start_time:
                                getCalendlyStartTime(
                                    calendlyPayload
                                ),
                            calendly_timezone:
                                getCalendlyTimezone(
                                    calendlyPayload
                                ),
                            session_date:
                                calendlySchedule.session_date,
                            session_time:
                                calendlySchedule.session_time
                        })
                }
            );

        if (!response.ok) {

            const errBody =
                await response.json().catch(() => ({}));

            console.error(
                "[Calendly] Error POST /api/mentor/book:",
                response.status,
                errBody
            );

            showToast(
                errBody.error ||
                `Error al guardar (${response.status})`
            );

            calendlyBookingInProgress =
                false;

            return false;

        }

        const result =
            await response.json();

        console.log(
            "[Calendly] Mentoría guardada en SUClassroom:",
            result
        );

        calendlyContext =
            null;

        closeCalendly();

        showToast(
            "Mentoría agendada correctamente"
        );

        setTimeout(
            () => {

                window.location.href =
                    "./mentorships.html";

            },
            2500
        );

        return true;

    } catch (err) {

        console.error(
            "[Calendly] Error en bookMentorshipDb:",
            err
        );

        showToast(
            "Error al guardar la mentoría."
        );

        return false;

    }

}

/* CALENDLY EVENT LISTENER */

window.addEventListener(
    "message",
    (e) => {

        if (
            !e.data ||
            typeof e.data.event !==
                "string" ||
            e.data.event.indexOf(
                "calendly."
            ) !== 0
        ) {

            return;

        }

        if (
            e.data.event !==
                "calendly.event_scheduled"
        ) {

            return;

        }

        console.log(
            "[Calendly] event_scheduled event.data:",
            e.data
        );

        console.log(
            "[Calendly] event_scheduled payload:",
            e.data.payload
        );

        console.log(
            "[Calendly] event_scheduled payload.event:",
            e.data.payload &&
            e.data.payload.event
        );

        console.log(
            "[Calendly] event_scheduled payload.invitee:",
            e.data.payload &&
            e.data.payload.invitee
        );

        if (!calendlyContext) {

            console.warn(
                "[Calendly] No hay contexto de mentor"
            );

            return;

        }

        console.log(
            "[Calendly] Reserva confirmada, guardando..."
        );

        bookMentorshipDb(
            calendlyContext.mentorId,
            calendlyContext.courseId,
            e.data.payload || {}
        );

    }
);

/* CLOSE */

closeModal.addEventListener(
    "click",
    () => {

        modal.classList.remove(
            "active-modal"
        );

    }
);

modal.addEventListener(
    "click",
    (e) => {

        if (e.target === modal) {

            modal.classList.remove(
                "active-modal"
            );

        }

    }
);

/* SELECT */

modalSelectBtn.addEventListener(
    "click",
    () => {

        if (!selectedMentorId) {

            showToast(
                "No se pudo seleccionar el mentor."
            );

            return;

        }

        openCalendly(
            selectedMentorId
        );

    }
);

loadMentors();
