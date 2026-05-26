let selectedCourseForMentor =
    null;

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

const myCoursesGrid =
    document.getElementById(
        "myCoursesGrid"
    );

async function loadMyCourses() {

    const studentResponse =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    const studentCourses =
        await studentResponse.json();

    const courseResponse =
        await fetch(
            `${API_URL}/api/courses`
        );

    const courses =
        await courseResponse.json();

    myCoursesGrid.innerHTML = "";

    if (studentCourses.length === 0) {

        myCoursesGrid.innerHTML = `

            <div class="empty-state">

                <h3>
                    Aún no tienes cursos solicitados
                </h3>

                <p>
                    Compra un curso desde el dashboard para empezar.
                </p>

            </div>

        `;

        return;
    }

    for (const relation of studentCourses) {

        const course =
            courses.find(
                c => c.id === relation.course_id
            );

        if (!course) return;

        const isUnlocked =
            relation.unlocked === true;
        
        let progressPercent = 0;

        if (isUnlocked) {

            const progressResponse =
                await fetch(
                    `${API_URL}/api/progress/${user.id}/${course.id}`
                );

            const progressData =
                await progressResponse.json();

            const completedLessons =
                progressData.filter(
                    item => item.completed === true
                );

            progressPercent =
                completedLessons.length > 0
                    ? 100
                    : 0;
        }

        myCoursesGrid.innerHTML += `

            <div class="
                my-course-card
                ${!isUnlocked ? "pending-course" : ""}
            ">

                <img
                    src="${course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            }"
                >

                <div class="my-course-content">

                    <span>
                        ${course.category || "Curso"}
                    </span>

                    <h3>
                        ${course.title}
                    </h3>

                    <div class="
                        course-status
                        ${isUnlocked ? "approved-status" : "pending-status"}
                    ">
                        ${isUnlocked
                ? "Desbloqueado"
                : "Pendiente de aprobación"
            }
                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width:${progressPercent}%;"   
                        ></div>

                    </div>

                    <button
                        class="continue-btn"
                        ${!isUnlocked ? "disabled" : ""}
                        onclick="${isUnlocked
                ? `window.location.href='./course-player.html?id=${course.id}'`
                : ""
            }"
                    >
                        ${isUnlocked
                ? "Continuar"
                : "Esperando aprobación"
            }
                    </button>

                    <button

                    class="mentor-select-btn"

                        onclick="
                    openMentorModal(
                        '${course.id}'
                    )
                    "

                    >
                     Elegir mentor
                    </button>

                </div>

            </div>

        `;

    }

}

const mentorModal =
    document.querySelector(
        ".mentor-modal"
    );

const closeMentorModal =
    document.querySelector(
        ".close-mentor-modal"
    );

const mentorList =
    document.getElementById(
        "mentorList"
    );

async function openMentorModal(courseId) {

    selectedCourseForMentor =
        courseId;

    mentorModal.classList.add(
        "active-modal"
    );

    const response =
        await fetch(
            `${API_URL}/api/student-mentors/mentors`
        );

    const mentors =
        await response.json();

    mentorList.innerHTML = "";

    if (mentors.length === 0) {

        mentorList.innerHTML = `

            <div class="empty-state">

                <h3>
                    No hay mentores disponibles
                </h3>

                <p>
                    El administrador debe asignar usuarios con rol mentor.
                </p>

            </div>

        `;

        return;
    }

    mentors.forEach(mentor => {

        mentorList.innerHTML += `

            <div class="mentor-item">

                <div class="mentor-avatar">
                    ${mentor.full_name.charAt(0)}
                </div>

                <h3>
                    ${mentor.full_name}
                </h3>

                <p>
                    ${mentor.email}
                </p>

                <button
                    onclick="assignMentor('${mentor.id}')"
                >
                    Seleccionar
                </button>

            </div>

        `;

    });

}

closeMentorModal.addEventListener(
    "click",
    () => {

        mentorModal.classList.remove(
            "active-modal"
        );

    }
);

async function assignMentor(mentorId) {

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
                        mentorId,

                    course_id:
                        selectedCourseForMentor

                })
        }
    );

    mentorModal.classList.remove(
        "active-modal"
    );

    alert(
        "Mentor asignado correctamente"
    );

}

loadMyCourses();