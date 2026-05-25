
const adminToast =
    document.querySelector(".admin-toast");

const adminToastMessage =
    document.getElementById("adminToastMessage");

function showAdminToast(message) {

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

const paymentsTableBody =
    document.getElementById(
        "paymentsTableBody"
    );

const searchPayment =
    document.getElementById(
        "searchPayment"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );

let currentFilter =
    "all";

/* LOAD */

async function loadPayments() {

    const response =
        await fetch(

            "http://localhost:3000/api/payments"

        );

    let payments =
        await response.json();

    /* FILTER */

    if (

        currentFilter !== "all"

    ) {

        payments =
            payments.filter(

                (payment) =>

                    payment.status ===
                    currentFilter

            );

    }

    /* SEARCH */

    const searchValue =
        searchPayment.value
            .toLowerCase();

    payments =
        payments.filter(

            (payment) =>

                payment.user_name
                    .toLowerCase()
                    .includes(searchValue)

        );

    paymentsTableBody.innerHTML = "";

    payments.forEach(

        (payment) => {

            paymentsTableBody.innerHTML += `

                <tr>

                    <td>

                        ${payment.user_name}

                    </td>

                    <td>

                        ${payment.course_name}

                    </td>

                    <td>

                        ${payment.payment_method}

                    </td>

                    <td>

                        S/ ${payment.amount}

                    </td>

                    <td>

                        <div class="
                            payment-status
                            ${payment.status}
                        ">

                            ${payment.status}

                        </div>

                    </td>

                    <td>

                        <div class="payment-actions">

                            <button

                                class="approve-btn"

                                onclick="
                                    updatePaymentStatus(
                                        '${payment.id}',
                                        'aprobado'
                                    )
                                "
                            >

                                Aprobar

                            </button>

                            <button

                                class="pending-btn"

                                onclick="
                                    updatePaymentStatus(
                                      '${payment.id}',
                                        'pendiente'
                                    )
                                "
                            >

                                Pendiente

                            </button>

                            <button

                                class="reject-btn"

                                onclick="
                                    updatePaymentStatus(
                                        '${payment.id}',
                                        'rechazado'
                                    )
                                "
                            >

                                Rechazar

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }

    );

    if (payments.length === 0) {

        paymentsTableBody.innerHTML = `

        <tr>

            <td colspan="6">

                <div class="empty-state">

                    <div class="empty-icon">

                        💳

                    </div>

                    <h3>

                        No hay pagos

                    </h3>

                    <p>

                        Aún no existen pagos registrados.

                    </p>

                </div>

            </td>

        </tr>

    `;

        return;

    }

}

/* UPDATE */

async function updatePaymentStatus(

    paymentId,
    status

) {

    await fetch(

        `http://localhost:3000/api/payments/${paymentId}`,

        {

            method: "PUT",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify({

                    status

                })

        }

    );

    loadPayments();

}

/* SEARCH */

searchPayment.addEventListener(

    "input",

    loadPayments

);

/* FILTERS */

filterButtons.forEach(

    (button) => {

        button.addEventListener(

            "click",

            () => {

                filterButtons.forEach(

                    (btn) => {

                        btn.classList.remove(
                            "active-filter"
                        );

                    }

                );

                button.classList.add(
                    "active-filter"
                );

                currentFilter =
                    button.dataset.status;

                loadPayments();

            }

        );

    }

);

loadPayments();