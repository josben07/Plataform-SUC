
const user =
    JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "mentor") {
    window.location.href = "../login.html";
}

const mentorSessionsGrid =
    document.getElementById("mentorSessionsGrid");

async function loadMentorSessions() {

    const response =
        await fetch(`${API_URL}/api/mentor`);

    const sessions =
        await response.json();

    const reservedSessions =
        sessions.filter(
            session =>

                session.status ===
                "reserved"

                &&

                session.mentor_name ===
                user.full_name
        );

    mentorSessionsGrid.innerHTML = "";

    if (reservedSessions.length === 0) {

        mentorSessionsGrid.innerHTML = `

            <div class="empty-state">
                <h3>No tienes mentorías reservadas</h3>
                <p>Cuando un alumno solicite una mentoría, aparecerá aquí.</p>
            </div>

        `;

        return;
    }

    reservedSessions.forEach(session => {

        mentorSessionsGrid.innerHTML += `

            <div class="session-card">

                <h3>${session.session_title}</h3>

                <p>Mentor: ${session.mentor_name}</p>

                <p>Alumno: ${session.student_name || "No asignado"}</p>

                <p>Fecha: ${session.session_date || "Por definir"}</p>

                <p>Hora: ${session.session_time || "Por definir"}</p>

                <div class="session-status reserved">
                    Reservada
                </div>

                ${session.meet_link
                ?
                `
                    <a
                        href="${session.meet_link}"
                        target="_blank"
                        class="meet-btn"
                    >
                        Entrar a reunión
                    </a>
                    `
                :
                ""
            }

            </div>

        `;

    });

}

loadMentorSessions();