const user =
    JSON.parse(
        localStorage.getItem("user")
    );

const myCoursesGrid =
    document.getElementById(
        "myCoursesGrid"
    );

function calculateProgressPercent(
    progressData,
    totalLessons
) {

    if (totalLessons === 0) {

        return 0;

    }

    const completedLessonIds =
        new Set(
            progressData
                .filter(item => item.completed === true)
                .map(item => item.lesson_id)
        );

    return Math.min(
        100,
        Math.round(
            (
                completedLessonIds.size /
                totalLessons
            ) * 100
        )
    );

}

async function getCourseLessonCount(courseId) {

    const modulesResponse =
        await fetch(
            `${API_URL}/api/modules/${courseId}`
        );

    const modules =
        await modulesResponse.json();

    let totalLessons =
        0;

    for (const module of modules) {

        const lessonsResponse =
            await fetch(
                `${API_URL}/api/lessons/${module.id}`
            );

        const lessons =
            await lessonsResponse.json();

        const lessonIds =
            new Set(
                lessons.map(lesson => lesson.id)
            );

        totalLessons +=
            lessonIds.size;

    }

    return totalLessons;

}

async function loadMyCourses() {

    const studentResponse =
        await fetch(
            `${API_URL}/api/student-courses/${user.id}`
        );

    const studentCourses =
        await studentResponse.json();

    const visibleStudentCourses =
        studentCourses.filter(
            relation =>
                relation.status === "Activo" ||
                relation.status === "Completed"
        );

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

    if (visibleStudentCourses.length === 0) {

        myCoursesGrid.innerHTML = `

            <div class="empty-state">

                <h3>
                    Aún no tienes cursos activos
                </h3>

                <p>
                    Inscríbete en un curso desde el dashboard para empezar.
                </p>

            </div>

        `;

        return;
    }

    for (const relation of visibleStudentCourses) {

        const course =
            courses.find(
                c => c.id === relation.course_id
            );

        if (!course) {
            continue;
        }

        const courseStatus =
            relation.status || "Disponible";

        const isActive =
            courseStatus === "Activo";

        const isCompleted =
            courseStatus === "Completed";

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

        const progressResponse =
            await fetch(
                `${API_URL}/api/progress/${user.id}/${course.id}`
            );

        const progressData =
            await progressResponse.json();

        const totalLessons =
            await getCourseLessonCount(course.id);

        const progressPercent =
            calculateProgressPercent(
                progressData,
                totalLessons
            );

        myCoursesGrid.innerHTML += `

            <div class="
                my-course-card
                ${isCompleted ? "completed-course" : ""}
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
                        ${isActive
                ? "approved-status"
                : "completed-status"
            }
                    ">

                        ${isActive
                ? "Activo"
                : "Completado"
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
                        onclick="
                            window.location.href =
                            './course-player.html?id=${course.id}'
                        "
                    >

                        ${isActive
                ? "Continuar"
                : "Ver curso"
            }

                    </button>

                    ${isActive
                ?
                `
                        <button
                            class="mentor-select-btn"
                            onclick="
                                window.location.href =
                                './select-mentor.html?courseId=${course.id}'
                            "
                        >

                            Elegir mentor

                        </button>
                        `
                :
                ""
            }

                </div>

            </div>

        `;

    }

}

loadMyCourses();
