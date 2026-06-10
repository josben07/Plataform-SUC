const user =
    JSON.parse(
        localStorage.getItem("user")
    );

const notesGrid =
    document.getElementById(
        "notesGrid"
    );

async function loadAllNotes() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/notes/${user.id}`
            );

        const notes =
            await response.json();

        notesGrid.innerHTML =
            "";

        if (
            !notes ||
            notes.length === 0
        ) {

            notesGrid.innerHTML = `
                <div class="notes-empty">
                    <div class="notes-empty-icon">📝</div>
                    <h3>Aún no tienes apuntes</h3>
                    <p>Escribe tus primeros apuntes desde el reproductor del curso.</p>
                </div>
            `;

            return;

        }

        const grouped =
            {};

        notes.forEach(note => {

            const key =
                note.course_id;

            if (!grouped[key]) {

                grouped[key] = {
                    course_id:
                        note.course_id,
                    course_title:
                        note.course_title ||
                        "Curso",
                    course_thumbnail:
                        note.course_thumbnail ||
                        null,
                    items:
                        []
                };

            }

            grouped[key].items
                .push(note);

        });

        Object.values(grouped)
            .forEach(group => {

                const courseLink =
                    `./course-player.html?id=${group.course_id}&openNotes=true`;

                notesGrid.innerHTML += `
                    <div class="notes-course-group">

                        <div class="notes-course-header">

                            <img
                                src="${group.course_thumbnail ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                }"
                                alt="${group.course_title}"
                            >

                            <div>

                                <a
                                    href="${courseLink}"
                                    class="notes-course-title"
                                >
                                    ${group.course_title}
                                </a>

                                <span class="notes-course-count">
                                    ${group.items.length}
                                    ${group.items.length === 1
                    ? "apunte"
                    : "apuntes"
                }
                                </span>

                            </div>

                        </div>

                        <div class="notes-items">

                            ${group.items.map(note => {

                    const date =
                        new Date(
                            note.updated_at ||
                            note.created_at
                        );

                    const formattedDate =
                        date.toLocaleDateString(
                            "es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        );

                    const content =
                        note.content ||
                        "";

                    const preview =
                        content.substring(
                            0,
                            200
                        );

                    const hasMore =
                        content.length >
                        200;

                    return `
                                    <div class="notes-item">

                                        <div class="notes-item-lesson">
                                            ${note.lesson_title ||
                        "Clase"
                    }
                                        </div>

                                        <div class="notes-item-content">
                                            ${preview}
                                            ${hasMore
                        ? "..."
                        : ""
                    }
                                        </div>

                                        ${!content
                        ? `
                                            <div class="notes-item-empty">
                                                Sin contenido
                                            </div>
                                        `
                        : ""
                    }

                                        <div class="notes-item-footer">

                                            <span class="notes-item-date">
                                                ${formattedDate}
                                            </span>

                                            <a
                                                href="${courseLink}"
                                                class="notes-item-link"
                                            >
                                                Abrir clase →
                                            </a>

                                        </div>

                                    </div>
                                `;

                }).join("")}

                        </div>

                    </div>
                `;

            });

    } catch (err) {

        console.error(err);

        notesGrid.innerHTML = `
            <div class="notes-empty">
                <h3>Error al cargar apuntes</h3>
                <p>No se pudieron cargar tus apuntes. Intenta nuevamente.</p>
            </div>
        `;

    }

}

loadAllNotes();
