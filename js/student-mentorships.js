const user =
    JSON.parse(
        localStorage.getItem("user")
    );

const mentorshipGrid =
    document.getElementById(
        "mentorshipGrid"
    );

let assignedMentors =
    [];

let activeStudentCourse =
    null;

function showMentorshipMessage(message) {

    const toast =
        document.querySelector(".app-toast");

    const toastMessage =
        document.getElementById("appToastMessage");

    if (!toast || !toastMessage) {

        return;

    }

    toastMessage.textContent =
        message;

    toast.classList.add(
        "show-toast"
    );

    setTimeout(
        () => {

            toast.classList.remove(
                "show-toast"
            );

        },
        3000
    );

}

async function loadActiveStudentCourse() {

    const response =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    if (!response.ok) {

        return null;

    }

    const studentCourses =
        await response.json();

    return studentCourses.find(course =>
        course.status === "Activo"
    ) || null;

}

function canScheduleMentorship() {

    return Boolean(
        activeStudentCourse &&
        activeStudentCourse.final_project_approved === true
    );

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

function getMentorshipPayment(payments, sessionId) {

    return payments.find(payment =>
        payment.student_id === user.id &&
        payment.session_id === sessionId &&
        payment.payment_type === "mentor"
    );

}

async function loadMentorships() {

    activeStudentCourse =
        await loadActiveStudentCourse();

    if (!activeStudentCourse) {

        mentorshipGrid.innerHTML = `

            <div class="empty-state">

                <h3>
                    No hay curso activo
                </h3>

                <p>
                    Debes tener un curso activo y tu proyecto final aprobado para agendar una mentoría.
                </p>

            </div>

        `;

        return;

    }

    const assignedResponse =
        await fetch(
            `${API_URL}/api/student-mentors/${user.id}`
        );

    assignedMentors =
        await assignedResponse.json();

    const activeCourseMentors =
        assignedMentors.filter(item =>
            String(item.course_id) === String(activeStudentCourse.course_id)
        );

    const assignedMentorIds =
        activeCourseMentors.map(
            item => item.mentor_id
        );

    const mentorshipUnlocked =
        canScheduleMentorship();

    const profilesResponse =
        await fetch(
            `${API_URL}/api/mentor-profiles`
        );

    const mentorProfiles =
        await profilesResponse.json();

    const myMentors =
        mentorProfiles.filter(
            mentor =>
                assignedMentorIds.includes(mentor.id)
        );

    const response =
        await fetch(
            `${API_URL}/api/mentor`
        );

    const sessions =
        await response.json();

    const paymentsResponse =
        await fetch(
            `${API_URL}/api/payments`
        );

    const payments =
        await paymentsResponse.json();

    mentorshipGrid.innerHTML = "";

    if (!mentorshipUnlocked) {

        mentorshipGrid.innerHTML += `

            <div class="assigned-mentors-banner">

                <h3>
                    Proyecto final pendiente
                </h3>

                <p>
                    Debes tener tu proyecto final aprobado para agendar una mentoría.
                </p>

            </div>

        `;

    }

    if (myMentors.length > 0) {

        mentorshipGrid.innerHTML += `

        <div class="assigned-mentors-banner">

            <h3>
                Tus mentores asignados
            </h3>

            <p>
                Solo puedes agendar reuniones con los mentores que seleccionaste para tus cursos.
            </p>

            <div class="assigned-mentor-list">

                ${myMentors.map(mentor => `

                        <span>
                            ${mentor.full_name}
                        </span>

                    `).join("")
            }

            </div>

        </div>

    `;

    }

    if (sessions.length === 0) {

        mentorshipGrid.innerHTML = `

            <div class="empty-state">

                <h3>
                    No hay mentorías disponibles
                </h3>

                <p>
                    Cuando el administrador cree mentorías, aparecerán aquí.
                </p>

            </div>

        `;

        return;

    }

    sessions.forEach(session => {

        const isAssignedMentor =
            assignedMentorIds.includes(
                session.mentor_id
            );

        const sessionStatus =
            session.status || "available";

        const payment =
            getMentorshipPayment(
                payments,
                session.id
            );

        const isOwnReservation =
            isAssignedMentor &&
            session.student_id === user.id;

        const isPaymentApproved =
            payment &&
            payment.status === "aprobado";

        mentorshipGrid.innerHTML += `

            <div class="
                mentor-card
                ${!isAssignedMentor || !mentorshipUnlocked ? "locked-mentorship" : ""}
            ">

                <h3>
                    ${session.session_title}
                </h3>

                <p>
                    Mentor: ${session.mentor_name}
                </p>

                <p>
                    ${session.mentor_specialty || ""}
                </p>

                <p>
                    Fecha: ${session.session_date || "Por definir"}
                </p>

                <p>
                    Hora: ${session.session_time || "Por definir"}
                </p>

                <p class="mentor-price">
                    Precio: ${formatMentorshipPrice(session.price)}
                </p>

                <div class="mentor-status">

                    ${!isAssignedMentor
                ? "Bloqueada"
                : !mentorshipUnlocked
                    ? "Bloqueada"
                : sessionStatus === "available"
                    ? "Disponible"
                    : isOwnReservation && !isPaymentApproved
                        ? "Pago pendiente"
                    : "Reservada"
            }

                </div>

                ${!isAssignedMentor
                ?
                `
                    <div class="locked-message">
                        Debes seleccionar este mentor en uno de tus cursos para agendar.
                    </div>

                    <button
                        class="mentor-btn"
                        disabled
                    >
                        Mentor no seleccionado
                    </button>
                    `
                :
                !mentorshipUnlocked
                    ?
                    `
                    <div class="locked-message">
                        Debes tener tu proyecto final aprobado para agendar una mentoría.
                    </div>

                    <button
                        class="mentor-btn"
                        disabled
                    >
                        Solicitar mentoría
                    </button>
                    `
                :
                isOwnReservation &&
                    !isPaymentApproved
                    ?
                    `
                    <div class="locked-message">
                        Mentoría reservada. Esperando aprobación del pago.
                    </div>
                    `
                    :
                    isOwnReservation &&
                    isPaymentApproved &&
                    session.meet_link
                    ?
                    `
                    <a
                        href="${session.meet_link}"
                        target="_blank"
                        class="meet-link"
                    >
                        Entrar a reunión
                    </a>
                    `
                    :
                    ""
            }

                ${isAssignedMentor && mentorshipUnlocked && sessionStatus === "available"
                ?
                `
                    <button
                        class="mentor-btn"
                        onclick="requestMentorship('${session.id}')"
                    >
                        Solicitar mentoría
                    </button>
                    `
                :
                isAssignedMentor && !mentorshipUnlocked
                    ?
                    ""
                    :
                isAssignedMentor && session.student_id === user.id
                    ?
                    `
                    <button
                        class="mentor-btn cancel-btn"
                        onclick="cancelMentorship('${session.id}')"
                    >
                        Cancelar reserva
                    </button>
                    `
                    :
                    isAssignedMentor
                        ?
                        `
                    <button
                        class="mentor-btn"
                        disabled
                    >
                        Reservada
                    </button>
                    `
                        :
                        ""
            }

            </div>

        `;

    });

}

async function requestMentorship(mentorshipId) {

    activeStudentCourse =
        await loadActiveStudentCourse();

    if (!activeStudentCourse) {

        showMentorshipMessage(
            "Debes tener un curso activo para agendar una mentoría."
        );

        return;

    }

    if (!canScheduleMentorship()) {

        showMentorshipMessage(
            "Debes tener tu proyecto final aprobado para agendar una mentoría."
        );

        return;

    }

    const response =
        await fetch(
        `${API_URL}/api/mentor/request/${mentorshipId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({

                    student_id:
                        user.id,

                    student_name:
                        user.full_name

                })
        }
    );

    const result =
        await response.json();

    if (!response.ok) {

        showMentorshipMessage(
            result.error ||
            "No se pudo reservar la mentoría."
        );

        return;

    }

    loadMentorships();

}

async function cancelMentorship(mentorshipId) {

    await fetch(
        `${API_URL}/api/mentor/cancel/${mentorshipId}`,
        {
            method: "PUT"
        }
    );

    loadMentorships();

}

loadMentorships();
