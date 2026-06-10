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

const priceMentorSelect =
    document.getElementById("priceMentorSelect");

const priceInput =
    document.getElementById("priceInput");

const savePriceBtn =
    document.getElementById("savePriceBtn");

const priceList =
    document.getElementById("priceList");

const mentorCount =
    document.getElementById("mentorCount");

let mentorsUsers =
    [];

/* LOAD MENTORS */

async function loadMentorUsers() {

    const response =
        await fetch(
            `${API_URL}/api/mentor-profiles`
        );

    mentorsUsers =
        await response.json();

    priceMentorSelect.innerHTML = `

        <option value="">
            Seleccionar mentor
        </option>

    `;

    mentorsUsers.forEach(mentor => {

        priceMentorSelect.innerHTML += `

            <option value="${mentor.id}">
                ${mentor.full_name}
            </option>

        `;

    });

}

/* LOAD PRICE ON SELECT */

priceMentorSelect.addEventListener("change", () => {

    const mentor =
        mentorsUsers.find(
            m => m.id === priceMentorSelect.value
        );

    if (
        mentor &&
        mentor.profile &&
        mentor.profile.base_price != null
    ) {

        priceInput.value =
            mentor.profile.base_price;

    } else {

        priceInput.value =
            "";

    }

});

/* RENDER PRICE LIST */

function renderPriceList() {

    const withPrice =
        mentorsUsers.filter(
            m =>
                m.profile &&
                m.profile.base_price != null
        );

    mentorCount.textContent =
        `${withPrice.length} mentores`;

    if (withPrice.length === 0) {

        priceList.innerHTML = `

            <div class="price-empty">

                <div class="price-empty-icon">
                    💰
                </div>

                <h3>
                    Selecciona un mentor y guarda su precio
                </h3>

                <p>
                    Los precios aparecerán aquí una vez asignados.
                </p>

            </div>

        `;

        return;

    }

    priceList.innerHTML =
        "";

    withPrice.forEach(mentor => {

        const price =
            Number(
                mentor.profile.base_price
            ).toFixed(2);

        priceList.innerHTML += `

            <div class="price-row">

                <div class="price-row-left">

                    <div class="price-avatar">

                        <img
                            src="${mentor.profile.photo_url || '../../assets/default-avatar.png'}"
                        >

                    </div>

                    <div>

                        <div class="price-name">
                            ${mentor.full_name}
                        </div>

                        <div class="price-position">
                            ${mentor.profile.position || "Mentor"}
                        </div>

                    </div>

                </div>

                <div class="price-row-right">

                    <span class="price-value">
                        S/ ${price}
                    </span>

                    <button
                        class="price-btn-clear"
                        onclick="clearPrice('${mentor.id}')"
                    >
                        Quitar
                    </button>

                </div>

            </div>

        `;

    });

}

/* CLEAR PRICE */

async function clearPrice(userId) {

    const response =
        await fetch(
            `${API_URL}/api/mentor-profiles`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        user_id: userId,
                        base_price: null
                    })
            }
        );

    if (response.ok) {

        /* refresh local data */

        const mentor =
            mentorsUsers.find(
                m => m.id === userId
            );

        if (mentor && mentor.profile) {

            mentor.profile.base_price =
                null;

        }

        renderPriceList();

        showAdminToast(
            "Precio eliminado"
        );

    }

}

/* SAVE PRICE */

savePriceBtn.addEventListener("click", async () => {

    const mentorId =
        priceMentorSelect.value;

    if (!mentorId) {

        showAdminToast(
            "Selecciona un mentor"
        );

        return;

    }

    const priceValue =
        priceInput.value.trim();

    if (priceValue === "") {

        showAdminToast(
            "Ingresa un precio"
        );

        return;

    }

    const response =
        await fetch(
            `${API_URL}/api/mentor-profiles`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        user_id: mentorId,
                        base_price:
                            Number(priceValue)
                    })
            }
        );

    const data =
        await response.json();

    if (response.ok) {

        /* update local data */

        const mentor =
            mentorsUsers.find(
                m => m.id === mentorId
            );

        if (mentor) {

            if (!mentor.profile) {

                mentor.profile = {};

            }

            mentor.profile.base_price =
                Number(priceValue);

        }

        renderPriceList();

        showAdminToast(
            "Precio base guardado correctamente"
        );

    } else {

        showAdminToast(
            data.needsMigration
                ? "⚠️ " + data.error
                : "Error al guardar el precio"
        );

    }

});

/* INIT */

async function init() {

    await loadMentorUsers();

    renderPriceList();

}

init();
