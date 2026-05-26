
const payModal =
    document.querySelector(".pay-modal");

const closePayModal =
    document.querySelector(".close-pay-modal");

const confirmPayBtn =
    document.getElementById("confirmPayBtn");

const payCourseName =
    document.getElementById("payCourseName");

const payAmount =
    document.getElementById("payAmount");

let currentPaymentId =
    null;

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
                <p>Cuando solicites un curso, el pago aparecerá aquí.</p>
            </div>

        `;

        return;
    }

    myPayments.forEach(payment => {

        paymentsGrid.innerHTML += `

            <div class="payment-card">

                <h3>${payment.course_name}</h3>

                <p>Alumno: ${payment.user_name}</p>

                <p>Método: ${payment.payment_method}</p>

                <p>Monto: S/ ${payment.amount}</p>

                <div class="payment-status ${payment.status}">
                    ${payment.status}
                </div>

                ${
            payment.status === "pendiente"
                ?
                `
    <button
        class="pay-action-btn"
        onclick="openPayModal('${payment.id}', '${payment.course_name}', '${payment.amount}')"
    >
        Ir a pagar
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
    courseName,
    amount

) {

    currentPaymentId =
        paymentId;

    payCourseName.textContent =
        `Curso: ${courseName}`;

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
                            "aprobado"
                    })
            }
        );

        payModal.classList.remove(
            "active-modal"
        );

        loadPayments();

    }
);

loadPayments();