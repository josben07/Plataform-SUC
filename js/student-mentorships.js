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

async function loadMentorships() {

    const assignedResponse =
        await fetch(
            `${API_URL}/api/student-mentors/${user.id}`
        );

    assignedMentors =
        await assignedResponse.json();

    const assignedMentorIds =
        assignedMentors.map(
            item => item.mentor_id
        );

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

    mentorshipGrid.innerHTML = "";

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

        mentorshipGrid.innerHTML += `

            <div class="
                mentor-card
                ${!isAssignedMentor ? "locked-mentorship" : ""}
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

                <div class="mentor-status">

                    ${!isAssignedMentor
                ? "Bloqueada"
                : session.status === "available"
                    ? "Disponible"
                    : session.status
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

                ${isAssignedMentor && session.status === "available"
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