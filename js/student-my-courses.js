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

    const assignedMentorsResponse =
        await fetch(
            `${API_URL}/api/student-mentors/${user.id}`
        );

    const assignedMentors =
        await assignedMentorsResponse.json();

    const mentorProfilesResponse =
        await fetch(
            `${API_URL}/api/mentor-profiles`
        );

    const mentorProfiles =
        await mentorProfilesResponse.json();

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

        if (!course) {
            continue;
        }

        const isUnlocked =
            relation.unlocked === true;

        const assignedMentor =
            assignedMentors.find(
                item =>
                    item.course_id === course.id
            );

        const mentorData =
            assignedMentor
                ?
                mentorProfiles.find(
                    mentor =>
                        mentor.id === assignedMentor.mentor_id
                )
                :
                null;

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
                    item =>
                        item.completed === true
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
                    alt="${course.title}"
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

                    ${mentorData
                ?
                `
                        <div class="assigned-mentor-box">

                            Mentor asignado:

                            <strong>
                                ${mentorData.full_name}
                            </strong>

                        </div>
                        `
                :
                `
                        <div class="assigned-mentor-box no-mentor">

                            Sin mentor asignado

                        </div>
                        `
            }

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
                            window.location.href=
                            './select-mentor.html?courseId=${course.id}'
                        "
                    >

                        Elegir mentor

                    </button>

                </div>

            </div>

        `;

    }

}

loadMyCourses();