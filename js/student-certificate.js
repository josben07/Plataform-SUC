const user = JSON.parse(localStorage.getItem("user"));
const params = new URLSearchParams(window.location.search);
const certificateId = params.get("id");

async function loadCertificate() {
    if (!certificateId) {
        document.getElementById("certStudentName").textContent = "Certificado no encontrado";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/certificates/${user.id}`);
        const certs = await res.json();
        const cert = certs.find(c => c.id === certificateId);

        if (!cert) {
            document.getElementById("certStudentName").textContent = "Certificado no encontrado";
            return;
        }

        document.getElementById("certStudentName").textContent = cert.student_name || user.full_name;
        document.getElementById("certCourseName").textContent = cert.course_title || "Curso";
        document.getElementById("certNumber").textContent = cert.certificate_number || "—";
        document.getElementById("certDescription").textContent = cert.courses?.description || "";

        const date = new Date(cert.issued_at);
        document.getElementById("certDate").textContent = date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const mentorRow = document.getElementById("certMentorRow");
        const mentorName = document.getElementById("certMentorName");
        if (cert.mentor_name) {
            mentorName.textContent = cert.mentor_name;
            mentorRow.style.display = "block";
        } else {
            mentorRow.style.display = "none";
        }

    } catch (err) {
        document.getElementById("certStudentName").textContent = "Error al cargar certificado";
    }
}

loadCertificate();
