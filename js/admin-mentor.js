const adminToast =
    document.querySelector(".admin-toast");

const adminToastMessage =
    document.getElementById("adminToastMessage");

function showAdminToast(message) {

    if (!adminToast || !adminToastMessage) return;

    adminToastMessage.textContent =
        message;

    adminToast.classList.add("show-toast");

    setTimeout(() => {
        adminToast.classList.remove("show-toast");
    }, 3000);

}

const deleteModal =
    document.querySelector(".delete-modal");

const confirmDeleteMentor =
    document.getElementById("confirmDeleteMentor");

const cancelDeleteMentor =
    document.getElementById("cancelDeleteMentor");

let deletingMentorId =
    null;

const mentorGrid =
    document.getElementById("mentorGrid");

const mentorModal =
    document.querySelector(".mentor-modal");

const openMentorModal =
    document.getElementById("openMentorModal");

const closeMentorModal =
    document.querySelector(".close-mentor-modal");

const mentorForm =
    document.getElementById("mentorForm");

const mentorSelect =
    document.getElementById("mentorSelect");

const sessionPrice =
    document.getElementById("sessionPrice");

let mentorsUsers =
    [];

let editingMentorId =
    null;

function normalizeMentorshipPriceForRequest(price) {

    if (price === "") {

        return null;

    }

    const numericPrice =
        Number(price);

    return Number.isFinite(numericPrice) &&
        numericPrice >= 0
        ? numericPrice
        : null;

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

/* LOAD USERS WITH ROLE MENTOR */

async function loadMentorUsers() {

    const response =
        await fetch(`${API_URL}/api/mentor-profiles`);

    mentorsUsers =
        await response.json();

    mentorSelect.innerHTML = `

        <option value="">
            Seleccionar mentor
        </option>

    `;

    mentorsUsers.forEach(mentor => {

        mentorSelect.innerHTML += `

            <option value="${mentor.id}">
                ${mentor.full_name}
            </option>

        `;

    });

}

/* AUTO-FILL SESSION PRICE WITH BASE PRICE */

mentorSelect.addEventListener("change", () => {

    const mentor =
        mentorsUsers.find(
            m => m.id === mentorSelect.value
        );

    if (
        mentor &&
        mentor.profile &&
        mentor.profile.base_price != null
    ) {

        sessionPrice.value =
            mentor.profile.base_price;

    }

});

/* OPEN MODAL */

openMentorModal.addEventListener("click", () => {

    mentorForm.reset();

    editingMentorId =
        null;

    mentorModal.classList.add("active-modal");

});

/* CLOSE */

closeMentorModal.addEventListener("click", () => {

    mentorModal.classList.remove("active-modal");

});

/* LOAD MENTOR SESSIONS */

async function loadMentors() {

    const response =
        await fetch(`${API_URL}/api/mentor`);

    const mentors =
        await response.json();

    mentorGrid.innerHTML = "";

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

    mentors.forEach(mentor => {

        const mentorUser =
            mentorsUsers.find(
                m => m.id === mentor.mentor_id
            );

        const basePrice =
            mentorUser?.profile?.base_price;

        mentorGrid.innerHTML += `

            <div class="mentor-card">

                <h3>
                    ${mentor.session_title}
                </h3>

                <p>
                    Mentor:
                    ${mentor.mentor_name}
                </p>

                <p style="color:#A89BFF; font-weight:700;">
                    Precio base del mentor:
                    $${basePrice ? Number(basePrice).toFixed(2) : "0.00"}
                </p>

                <p>
                    ${mentor.mentor_specialty || ""}
                </p>

                <p>
                    ${mentor.session_date || "Sin fecha"}
                </p>

                <p>
                    ${mentor.session_time || "Sin hora"}
                </p>

                <p class="mentor-price">
                    Precio: ${formatMentorshipPrice(mentor.price)}
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
                                '${mentor.mentor_id || ""}',
                                '${mentor.mentor_specialty || ""}',
                                '${mentor.session_title}',
                                '${mentor.session_description || ""}',
                                '${mentor.session_date || ""}',
                                '${mentor.session_time || ""}',
                                '${mentor.price ?? ""}',
                                '${mentor.meet_link || ""}'
                            )
                        "
                    >
                        Editar
                    </button>

                    <button
                        class="delete-mentor-btn"
                        onclick="deleteMentor('${mentor.id}')"
                    >
                        Eliminar
                    </button>

                </div>

            </div>

        `;

    });

}

/* CREATE / UPDATE */

mentorForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const selectedMentor =
        mentorsUsers.find(
            mentor => mentor.id === mentorSelect.value
        );

    if (!selectedMentor) {

        showAdminToast("Selecciona un mentor");

        return;

    }

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

                    mentor_id:
                        selectedMentor.id,

                    mentor_name:
                        selectedMentor.full_name,

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

                    price:
                        normalizeMentorshipPriceForRequest(
                            sessionPrice.value
                        ),

                    meet_link:
                        meetLink.value

                })
        }
    );

    mentorModal.classList.remove("active-modal");

    mentorForm.reset();

    editingMentorId =
        null;

    showAdminToast("Mentoría guardada correctamente");

    loadMentors();

});

/* EDIT */

function openEditMentorModal(

    id,
    mentor_id,
    mentor_specialty,
    session_title,
    session_description,
    session_date,
    session_time,
    price,
    meet_link

) {

    editingMentorId =
        id;

    mentorSelect.value =
        mentor_id;

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

    sessionPrice.value =
        price;

    meetLink.value =
        meet_link;

    mentorModal.classList.add("active-modal");

}

/* DELETE */

function deleteMentor(mentorId) {

    deletingMentorId =
        mentorId;

    deleteModal.classList.add("active-delete-modal");

}

/* CONFIRM DELETE */

confirmDeleteMentor.addEventListener("click", async () => {

    await fetch(
        `${API_URL}/api/mentor/${deletingMentorId}`,
        {
            method: "DELETE"
        }
    );

    deleteModal.classList.remove("active-delete-modal");

    showAdminToast("Mentoría eliminada correctamente");

    loadMentors();

});

/* CANCEL DELETE */

cancelDeleteMentor.addEventListener("click", () => {

    deleteModal.classList.remove("active-delete-modal");

});

/* INIT */

loadMentorUsers();
loadMentors();
