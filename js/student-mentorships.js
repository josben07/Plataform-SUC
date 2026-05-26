
const user =
    JSON.parse(
        localStorage.getItem("user")
    );

const mentorshipGrid =
    document.getElementById(
        "mentorshipGrid"
    );

async function loadMentorships() {

    const response =
        await fetch(
            `${API_URL}/api/mentor`
        );

    const sessions =
        await response.json();

    mentorshipGrid.innerHTML = "";

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

        mentorshipGrid.innerHTML += `

            <div class="mentor-card">

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

                    ${session.status === "available"

                ? "Disponible"

                : session.status

            }

                </div>

                ${session.meet_link

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

                ${session.status === "available"

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

                session.student_id === user.id

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

                    `
                                <button
                                    class="mentor-btn"
                                    disabled
                                >

                                    Reservada

                                </button>
                            `

            }

            </div>

        `;

    });

}

async function requestMentorship(

    mentorshipId

) {

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