
const adminToast =
    document.querySelector(
        ".admin-toast"
    );

const adminToastMessage =
    document.getElementById(
        "adminToastMessage"
    );

function showAdminToast(message) {

    if (
        !adminToast ||
        !adminToastMessage
    ) return;

    adminToastMessage.textContent =
        message;

    adminToast.classList.add(
        "show-toast"
    );

    setTimeout(() => {

        adminToast.classList.remove(
            "show-toast"
        );

    }, 3000);

}

const deleteModal =
    document.querySelector(
        ".delete-modal"
    );

const confirmDeleteMentor =
    document.getElementById(
        "confirmDeleteMentor"
    );

const cancelDeleteMentor =
    document.getElementById(
        "cancelDeleteMentor"
    );

let deletingMentorId =
    null;

const mentorGrid =
    document.getElementById(
        "mentorGrid"
    );

/* MODAL */

const mentorModal =
    document.querySelector(
        ".mentor-modal"
    );

const openMentorModal =
    document.getElementById(
        "openMentorModal"
    );

const closeMentorModal =
    document.querySelector(
        ".close-mentor-modal"
    );

/* FORM */

const mentorForm =
    document.getElementById(
        "mentorForm"
    );

/* OPEN */

openMentorModal.addEventListener(

    "click",

    () => {

        /* RESET */

        mentorForm.reset();

        editingMentorId =
            null;

        mentorModal.classList.add(
            "active-modal"
        );

    }

);

/* CLOSE */

closeMentorModal.addEventListener(

    "click",

    () => {

        mentorModal.classList.remove(
            "active-modal"
        );

    }

);

/* LOAD */

async function loadMentors() {

    const response =
        await fetch(

            `${API_URL}/api/mentor`

        );

    const mentors =
        await response.json();

    mentorGrid.innerHTML = "";

    mentors.forEach(

        (mentor) => {

            mentorGrid.innerHTML += `

                <div class="mentor-card">

                    <h3>

                        ${mentor.session_title}

                    </h3>

                    <p>

                        Mentor:
                        ${mentor.mentor_name}

                    </p>

                    <p>

                        ${mentor.mentor_specialty}

                    </p>

                    <p>

                        ${mentor.session_date}

                    </p>

                    <p>

                        ${mentor.session_time}

                    </p>

                    <div class="mentor-status">

                        ${mentor.status === "available"

                    ? "Disponible"

                    : mentor.status

                }

                    </div>

                    <div class="mentor-actions">

                        <button

                            class="edit-mentor-btn"

                            onclick="
                                openEditMentorModal(
                                    '${mentor.id}',
                                    '${mentor.mentor_name}',
                                    '${mentor.mentor_specialty}',
                                    '${mentor.session_title}',
                                    '${mentor.session_description || ""}',
                                    '${mentor.session_date || ""}',
                                    '${mentor.session_time || ""}',
                                    '${mentor.meet_link || ""}'
                                )
                            "
                        >

                            Editar

                        </button>

                        <button

                            class="delete-mentor-btn"

                            onclick="
                                deleteMentor(
                                    '${mentor.id}'
                                )
                            "
                        >

                            Eliminar

                        </button>

                    </div>

                </div>

            `;

        }

    );

    if (mentors.length === 0) {

        mentorGrid.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">

                🎓

            </div>

            <h3>

                No hay mentorías

            </h3>

            <p>

                Aún no existen mentorías creadas.

            </p>

        </div>

    `;

        return;

    }

}

/* CREATE */

let editingMentorId =
    null;

mentorForm.addEventListener(

    "submit",

    async (e) => {

        e.preventDefault();

        const url =
            editingMentorId

                ? `${API_URL}/api/mentor/${editingMentorId}`

                : `${API_URL}/api/mentor`;

        const method =
            editingMentorId

                ? "PUT"

                : "POST";

        await fetch(

            url,

            {

                method,

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        mentor_name:
                            mentorName.value,

                        mentor_specialty:
                            mentorSpecialty.value,

                        session_title:
                            sessionTitle.value,

                        session_description:
                            sessionDescription.value,

                        session_date:
                            sessionDate.value,

                        session_time:
                            sessionTime.value,

                        meet_link:
                            meetLink.value

                    })

            }

        );

        mentorModal.classList.remove(
            "active-modal"
        );

        mentorForm.reset();

        editingMentorId =
            null;

        loadMentors();

    }

);

loadMentors();

/* ========================= */
/* EDIT MENTOR */
/* ========================= */

function openEditMentorModal(

    id,
    mentor_name,
    mentor_specialty,
    session_title,
    session_description,
    session_date,
    session_time,
    meet_link

) {

    editingMentorId = id;

    mentorName.value =
        mentor_name;

    mentorSpecialty.value =
        mentor_specialty;

    sessionTitle.value =
        session_title;

    sessionDescription.value =
        session_description;

    sessionDate.value =
        session_date;

    sessionTime.value =
        session_time;

    meetLink.value =
        meet_link;

    mentorModal.classList.add(
        "active-modal"
    );

}

/* ========================= */
/* DELETE */
/* ========================= */

function deleteMentor(

    mentorId

) {

    deletingMentorId =
        mentorId;

    deleteModal.classList.add(
        "active-delete-modal"
    );

}

/* CONFIRM DELETE */

confirmDeleteMentor.addEventListener(

    "click",

    async () => {

        await fetch(

            `${API_URL}/api/mentor/${deletingMentorId}`,

            {

                method: "DELETE"

            }

        );

        deleteModal.classList.remove(
            "active-delete-modal"
        );

        loadMentors();

    }

);

/* CANCEL */

cancelDeleteMentor.addEventListener(

    "click",

    () => {

        deleteModal.classList.remove(
            "active-delete-modal"
        );

    }

);