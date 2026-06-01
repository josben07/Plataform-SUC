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

const courseId =
    params.get("courseId");

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

/* LOAD MENTORS */

async function loadMentors() {

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

        mentorsGrid.innerHTML += `

            <div class="mentor-card">

                <div class="mentor-image">

                    <img
                        src="${profile.photo_url ||
            '../../assets/default-avatar.png'
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

                    <div class="mentor-footer">

                        <button
                            class="mentor-btn"
                            onclick="openMentorProfile('${mentor.id}')"
                        >
                            Ver perfil
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
    async () => {

        if (
            !selectedMentorId ||
            !courseId
        ) {

            showToast(
                "No se pudo seleccionar el mentor"
            );

            return;

        }

        const response =
            await fetch(
                `${API_URL}/api/student-mentors/assign`,
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
                                selectedMentorId,

                            course_id:
                                courseId

                        })
                }
            );

        if (response.ok) {

            modal.classList.remove(
                "active-modal"
            );

            showToast(
                "🎉 Mentor asignado correctamente. Tu proceso de acompañamiento ha comenzado."
            );

            setTimeout(() => {

                window.location.href =
                    "./my-courses.html";

            }, 2500);

        } else {

            showToast(
                "No se pudo guardar el mentor"
            );

        }

    }
);

loadMentors();