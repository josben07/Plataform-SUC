const payModal =
    document.querySelector(".pay-modal");

const closePayModal =
    document.querySelector(".close-pay-modal");

const confirmPayBtn =
    document.getElementById("confirmPayBtn");

const payModalTitle =
    document.getElementById("payModalTitle");

const payCourseName =
    document.getElementById("payCourseName");

const payAmount =
    document.getElementById("payAmount");

let currentPaymentId =
    null;

let currentPaymentType =
    "mentor";

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!user) {

    window.location.href =
        "../login.html";

}

const paymentsGrid =
    document.getElementById(
        "paymentsGrid"
    );

function showPaymentToast(message) {

    const toast =
        document.querySelector(".app-toast");

    const toastMessage =
        document.getElementById("appToastMessage");

    if (!toast || !toastMessage) {

        alert(message);
        return;

    }

    toastMessage.textContent =
        message;

    toast.classList.add("show-toast");

    setTimeout(() => {

        toast.classList.remove("show-toast");

    }, 3000);

}

function escapeInlineValue(value) {

    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "\\'")
        .replace(/\n/g, " ");

}

function getPaymentTitle(payment) {

    if (payment.payment_type === "mentor") {

        return payment.course_name
            ? `Mentoría - ${payment.course_name}`
            : "Mentoría";

    }

    return payment.course_name || "Pago";

}

function getPaymentStatusText(status) {

    if (status === "en_revision") {

        return "Esperando aprobación del administrador";

    }

    if (status === "pendiente") {

        return "Pendiente";

    }

    if (status === "aprobado") {

        return "Aprobado";

    }

    if (status === "rechazado") {

        return "Rechazado";

    }

    return status || "Pendiente";

}

async function loadPayments() {

    const response =
        await fetch(
            `${API_URL}/api/payments`
        );

    const payments =
        await response.json();

    const myPayments =
        payments.filter(payment =>
            payment.student_id === user.id ||
            payment.user_name === user.full_name
        );

    paymentsGrid.innerHTML = "";

    if (myPayments.length === 0) {

        paymentsGrid.innerHTML = `

            <div class="empty-state">
                <h3>No tienes pagos registrados</h3>
                <p>Cuando reserves una mentoría, el pago aparecerá aquí.</p>
            </div>

        `;

        return;
    }

    myPayments.forEach(payment => {

        const paymentTitle =
            getPaymentTitle(payment);

        paymentsGrid.innerHTML += `

            <div class="payment-card">

                <h3>${paymentTitle}</h3>

                <p>Alumno: ${payment.user_name}</p>

                <p>Método: ${payment.payment_method}</p>

                <p>Monto: S/ ${payment.amount}</p>

                <div class="payment-status ${payment.status}">
                    ${getPaymentStatusText(payment.status)}
                </div>

                ${
                    payment.status === "pendiente"
                        ?
                        `
                            <button
                                class="pay-action-btn"
                                onclick="openPayModal('${payment.id}', '${escapeInlineValue(paymentTitle)}', '${payment.amount}', '${payment.payment_type || "mentor"}')"
                            >
                                Ir a pagar
                            </button>
                        `
                        :
                        payment.status === "en_revision"
                            ?
                            `
                                <div class="payment-waiting-message">
                                    Pago enviado. Esperando aprobación del administrador.
                                </div>
                            `
                            :
                            payment.status === "aprobado" &&
                                payment.payment_type === "mentor"
                                ?
                                `
                                    <button
                                        class="continue-course-btn"
                                        onclick="window.location.href='./mentorships.html'"
                                    >
                                        Ver mentoría
                                    </button>
                                `
                                :
                                payment.status === "aprobado"
                                    ?
                                    `
                                        <button
                                            class="continue-course-btn"
                                            onclick="window.location.href='./course-player.html?id=${payment.course_id}'"
                                        >
                                            Continuar curso
                                        </button>
                                    `
                                    :
                                    ""
                }

            </div>

        `;

    });

}

function openPayModal(

    paymentId,
    paymentTitle,
    amount,
    paymentType = "mentor"

) {

    currentPaymentId =
        paymentId;

    currentPaymentType =
        paymentType;

    payModalTitle.textContent =
        currentPaymentType === "mentor"
            ? "Confirmar pago de mentoría"
            : "Confirmar pago";

    payCourseName.textContent =
        currentPaymentType === "mentor"
            ? `Mentoría: ${paymentTitle}`
            : `Curso: ${paymentTitle}`;

    payAmount.textContent =
        `Monto: S/ ${amount}`;

    payModal.classList.add(
        "active-modal"
    );

}

closePayModal.addEventListener(
    "click",
    () => {

        payModal.classList.remove(
            "active-modal"
        );

    }
);

confirmPayBtn.addEventListener(
    "click",
    async () => {

        await fetch(
            `${API_URL}/api/payments/${currentPaymentId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        status:
                            "en_revision"
                    })
            }
        );

        payModal.classList.remove(
            "active-modal"
        );

        await loadPayments();

        showPaymentToast(
            "Pago enviado. Esperando aprobación del administrador."
        );

    }
);

loadPayments();
