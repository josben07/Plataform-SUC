const settingsToast =
    document.querySelector(
        ".settings-toast"
    );

const toastMessage =
    document.getElementById(
        "toastMessage"
    );

function showToast(

    message

) {

    toastMessage.textContent =
        message;

    settingsToast.classList.add(
        "show-toast"
    );

    setTimeout(

        () => {

            settingsToast.classList.remove(
                "show-toast"
            );

        },

        3000

    );

}

/* ELEMENTS */

const platformName =
    document.getElementById(
        "platformName"
    );

const platformDescription =
    document.getElementById(
        "platformDescription"
    );

const mentorshipsToggle =
    document.getElementById(
        "mentorshipsToggle"
    );

const paymentsToggle =
    document.getElementById(
        "paymentsToggle"
    );

const maintenanceToggle =
    document.getElementById(
        "maintenanceToggle"
    );

const saveBrandingBtn =
    document.getElementById(
        "saveBrandingBtn"
    );

const savePasswordBtn =
    document.getElementById(
        "savePasswordBtn"
    );

const newPassword =
    document.getElementById(
        "newPassword"
    );

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );

/* LOAD */

async function loadSettings() {

    const response =
        await fetch(

            `${API_URL}/api/settings`

        );

    const settings =
        await response.json();

    platformName.value =
        settings.platform_name;

    platformDescription.value =
        settings.platform_description;

    mentorshipsToggle.checked =
        settings.mentorships_enabled;

    paymentsToggle.checked =
        settings.payments_enabled;

    maintenanceToggle.checked =
        settings.maintenance_mode;

}

/* SAVE */

async function saveSettings(password = null) {

    const bodyData = {

        platform_name:
            platformName.value.trim(),

        platform_description:
            platformDescription.value.trim(),

        mentorships_enabled:
            mentorshipsToggle.checked,

        payments_enabled:
            paymentsToggle.checked,

        maintenance_mode:
            maintenanceToggle.checked

    };

    if (password) {

        bodyData.admin_password =
            password;

    }

    await fetch(

        `${API_URL}/api/settings`,

        {
            method: "PUT",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify(bodyData)
        }

    );

}

/* Configuración General */

saveBrandingBtn.addEventListener(
    "click",
    async () => {

        const name =
            platformName.value.trim();

        const description =
            platformDescription.value.trim();

        if (name.length < 3) {

            showToast(
                "El nombre debe tener al menos 3 caracteres"
            );

            return;
        }

        if (description.length < 10) {

            showToast(
                "La descripción debe tener al menos 10 caracteres"
            );

            return;
        }

        await saveSettings();

        showToast(
            "Configuración guardada correctamente"
        );

    }
);

/* PASSWORD */

savePasswordBtn.addEventListener(
    "click",
    async () => {

        const password =
            newPassword.value.trim();

        const confirm =
            confirmPassword.value.trim();

        if (password === "" || confirm === "") {

            showToast(
                "Completa ambos campos de contraseña"
            );

            return;
        }

        if (password.length < 6) {

            showToast(
                "La contraseña debe tener mínimo 6 caracteres"
            );

            return;
        }

        if (password !== confirm) {

            showToast(
                "Las contraseñas no coinciden"
            );

            return;
        }

        await saveSettings(
            password
        );

        showToast(
            "Contraseña actualizada correctamente"
        );

        newPassword.value = "";
        confirmPassword.value = "";

    }
);

/* TOGGLES */

mentorshipsToggle.addEventListener(

    "change",

    saveSettings

);

paymentsToggle.addEventListener(

    "change",

    saveSettings

);

maintenanceToggle.addEventListener(

    "change",

    saveSettings

);

/* PAYMENT METHODS */

const paymentMethodsContainer =
    document.getElementById("paymentMethodsContainer");

let deleteTargetId =
    null;

let editTargetId =
    null;

let selectedPmType =
    null;

const PM_TYPE_CONFIG = {

    yape: {
        label: "Yape / Plin",
        fields: [
            { key: "number", placeholder: "Celular", type: "text" },
            { key: "holder", placeholder: "Titular", type: "text" }
        ]
    },

    banco: {
        label: "Banco",
        fields: [
            { key: "account", placeholder: "Cuenta", type: "text" },
            { key: "cci", placeholder: "CCI", type: "text" },
            { key: "holder", placeholder: "Titular", type: "text" }
        ]
    },

    paypal: {
        label: "PayPal",
        fields: [
            { key: "email", placeholder: "Correo electrónico", type: "text" },
            { key: "holder", placeholder: "Titular", type: "text" }
        ]
    },

    otro: {
        label: "Otro",
        fields: [
            { key: "number", placeholder: "Número / Cuenta", type: "text" },
            { key: "holder", placeholder: "Titular", type: "text" },
            { key: "cci", placeholder: "CCI (opcional)", type: "text" }
        ]
    }

};

function getTypeLabel(type) {

    const config =
        PM_TYPE_CONFIG[type];

    return config
        ? config.label
        : type || "Otro";

}

async function loadPaymentMethods() {

    const response =
        await fetch(
            `${API_URL}/api/payment-methods`
        );

    const methods =
        await response.json();

    renderPaymentMethods(methods);

}

function renderPaymentMethods(methods) {

    if (!paymentMethodsContainer) return;

    if (!methods || methods.length === 0) {

        paymentMethodsContainer.innerHTML =
            `<p style="color:rgba(255,255,255,0.4);padding:20px 0;text-align:center;">No hay métodos de pago configurados.</p>`;

        return;

    }

    paymentMethodsContainer.innerHTML =
        `<div class="pm-list">` +
        methods
            .map(method => {

                const active =
                    method.is_active !== false;

                const typeLabel =
                    getTypeLabel(method.type);

                return `
                    <div class="pm-item ${active ? "" : "inactive-pm"}" data-id="${method.id}">

                        <div class="pm-item-left">

                            <span class="pm-item-name">${method.name}</span>

                            <span class="pm-item-badge">${typeLabel}</span>

                        </div>

                        <div class="pm-item-actions">

                            <button
                                class="pm-active-btn ${active ? "active" : "inactive"}"
                                onclick="toggleActiveMethod('${method.id}')"
                            >
                                ${active ? "Activo" : "Desactivo"}
                            </button>

                            <button
                                class="pm-icon-btn edit-btn"
                                onclick="openEditModal('${method.id}')"
                                title="Editar método"
                            >
                                ✏️
                            </button>

                            <button
                                class="pm-icon-btn del-btn"
                                onclick="openDeleteModal('${method.id}')"
                                title="Eliminar método"
                            >
                                ✕
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("") +
        `</div>`;

}

async function toggleActiveMethod(id) {

    const card =
        document.querySelector(
            `.pm-item[data-id="${id}"]`
        );

    if (!card) return;

    const btn =
        card.querySelector(".pm-active-btn");

    if (!btn) return;

    const currentlyActive =
        btn.textContent.trim() === "Activo";

    const newActive = !currentlyActive;

    try {

        const response =
            await fetch(
                `${API_URL}/api/payment-methods/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            is_active: newActive
                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Error al cambiar estado"
            );

        }

        card.classList.toggle(
            "inactive-pm",
            !newActive
        );

        btn.textContent =
            newActive ? "Activo" : "Desactivo";

        btn.className =
            `pm-active-btn ${newActive ? "active" : "inactive"}`;

        showToast(
            newActive
                ? "Método activado"
                : "Método desactivado"
        );

    } catch (err) {

        showToast(
            "Error al cambiar estado"
        );

    }

}

/* CREATE MODAL */

function selectPmType(type) {

    selectedPmType =
        type;

    document
        .querySelectorAll(".pm-type-btn")
        .forEach(btn => {

            btn.classList.toggle(
                "active-type",
                btn.dataset.type === type
            );

        });

    const container =
        document.getElementById(
            "pmDynamicFields"
        );

    const inner =
        document.getElementById(
            "pmDynamicFieldsInner"
        );

    const config =
        PM_TYPE_CONFIG[type];

    if (!config) {

        container.style.display =
            "none";

        document.getElementById("pmCreateBtn").disabled =
            true;

        return;

    }

    container.style.display =
        "block";

    const namePlaceholder =
        type === "banco"
            ? "Nombre del banco (ej: BCP, Interbank)"
            : type === "paypal"
                ? "PayPal"
                : type === "yape"
                    ? "Yape / Plin"
                    : "Nombre del método";

    inner.innerHTML =
        `
            <label>${type === "banco" ? "Nombre del banco" : "Nombre del método"}</label>

            <input
                type="text"
                class="pm-create-name"
                placeholder="${namePlaceholder}"
                value="${config.label}"
            >
        ` +
        config.fields
            .map(f => `

                <label>${f.placeholder}</label>

                <input
                    type="${f.type || "text"}"
                    class="pm-create-${f.key}"
                    placeholder="${f.placeholder}"
                >

            `)
            .join("");

    document.getElementById("pmCreateBtn").disabled =
        false;

}

function openCreateModal() {

    selectedPmType =
        null;

    document
        .querySelectorAll(".pm-type-btn")
        .forEach(btn =>
            btn.classList.remove("active-type")
        );

    document.getElementById(
        "pmDynamicFields"
    ).style.display =
        "none";

    document.getElementById(
        "pmDynamicFieldsInner"
    ).innerHTML =
        "";

    document.getElementById("pmCreateBtn").disabled =
        true;

    document.getElementById("createPmModal").classList.add(
        "active-modal"
    );

}

function closeCreateModal() {

    document.getElementById("createPmModal").classList.remove(
        "active-modal"
    );

}

async function confirmCreateMethod() {

    if (!selectedPmType) {

        showToast(
            "Selecciona un tipo de método de pago"
        );

        return;

    }

    const config =
        PM_TYPE_CONFIG[selectedPmType];

    const inner =
        document.getElementById(
            "pmDynamicFieldsInner"
        );

    const nameInput =
        inner.querySelector(
            ".pm-create-name"
        );

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    if (!name) {

        showToast(
            "Escribe el nombre del método de pago"
        );

        return;

    }

    const fields =
        {};

    config.fields.forEach(f => {

        const input =
            inner.querySelector(
                `.pm-create-${f.key}`
            );

        const val =
            input
                ? input.value.trim()
                : "";

        if (val) fields[f.key] = val;

    });

    const createBtn =
        document.querySelector(
            "#createPmModal .pm-btn-confirm"
        );

    createBtn.disabled =
        true;

    createBtn.textContent =
        "Creando...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/payment-methods`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            type: selectedPmType,
                            name,
                            fields,
                            sort_order: 0
                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Error al crear"
            );

        }

        showToast(
            "Método agregado"
        );

        closeCreateModal();

        loadPaymentMethods();

    } catch (err) {

        showToast(
            "Error al crear método"
        );

    } finally {

        createBtn.disabled =
            false;

        createBtn.textContent =
            "Crear método";

    }

}

/* EDIT MODAL */

function openEditModal(id) {

    editTargetId =
        id;

    const card =
        document.querySelector(
            `.pm-item[data-id="${id}"]`
        );

    if (!card) return;

    /* fetch method data */
    fetch(
        `${API_URL}/api/payment-methods`
    )
        .then(r => r.json())
        .then(methods => {

            const method =
                methods.find(
                    m => m.id === id
                );

            if (!method) return;

            const fields =
                method.fields || {};

            const typeLabel =
                getTypeLabel(method.type);

            document.getElementById(
                "editPmTypeBadge"
            ).textContent =
                typeLabel;

            document.getElementById(
                "pmEditName"
            ).value =
                method.name || "";

            const config =
                PM_TYPE_CONFIG[method.type];

            const fieldDefs =
                config
                    ? config.fields
                    : [];

            const container =
                document.getElementById(
                    "pmEditFields"
                );

            container.innerHTML =
                fieldDefs
                    .map(f => {

                        const val =
                            fields[f.key] || "";

                        return `
                            <label>${f.placeholder}</label>
                            <input
                                type="${f.type || "text"}"
                                class="pm-edit-${f.key}"
                                value="${val}"
                                placeholder="${f.placeholder}"
                            >
                        `;

                    })
                    .join("");

            document.getElementById(
                "editPmModal"
            ).classList.add(
                "active-modal"
            );

        });

}

function closeEditModal() {

    editTargetId =
        null;

    document.getElementById("editPmModal").classList.remove(
        "active-modal"
    );

}

async function confirmEditMethod() {

    if (!editTargetId) return;

    const name =
        document.getElementById(
            "pmEditName"
        ).value.trim();

    if (!name) {

        showToast(
            "El nombre es requerido"
        );

        return;

    }

    const fields =
        {};

    document
        .querySelectorAll(
            "#pmEditFields input"
        )
        .forEach(input => {

            const cls =
                input.className;

            const key =
                cls.replace(
                    "pm-edit-",
                    ""
                );

            const val =
                input.value.trim();

            if (val) fields[key] = val;

        });

    const editBtn =
        document.getElementById(
            "pmEditBtn"
        );

    editBtn.disabled =
        true;

    editBtn.textContent =
        "Guardando...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/payment-methods/${editTargetId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            name,
                            fields
                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Error al guardar"
            );

        }

        showToast(
            "Método actualizado"
        );

        closeEditModal();

        loadPaymentMethods();

    } catch (err) {

        showToast(
            "Error al guardar"
        );

    } finally {

        editBtn.disabled =
            false;

        editBtn.textContent =
            "Guardar cambios";

    }

}

/* DELETE MODAL */

function openDeleteModal(id) {

    deleteTargetId =
        id;

    const card =
        document.querySelector(
            `.pm-item[data-id="${id}"]`
        );

    const name =
        card
            ? card.querySelector(".pm-item-name").textContent ||
              "este método"
            : "este método";

    document.getElementById("deletePmMessage").textContent =
        `¿Estás seguro de eliminar "${name}"?`;

    document.getElementById("deletePmModal").classList.add(
        "active-modal"
    );

}

function closeDeleteModal() {

    deleteTargetId =
        null;

    document.getElementById("deletePmModal").classList.remove(
        "active-modal"
    );

}

async function confirmDeleteMethod() {

    if (!deleteTargetId) return;

    const deleteBtn =
        document.querySelector(
            "#deletePmModal .pm-btn-danger"
        );

    deleteBtn.disabled =
        true;

    deleteBtn.textContent =
        "Eliminando...";

    try {

        const response =
            await fetch(
                `${API_URL}/api/payment-methods/${deleteTargetId}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Error al eliminar"
            );

        }

        showToast(
            "Método eliminado"
        );

        closeDeleteModal();

        loadPaymentMethods();

    } catch (err) {

        showToast(
            "Error al eliminar"
        );

    } finally {

        deleteBtn.disabled =
            false;

        deleteBtn.textContent =
            "Eliminar";

    }

}

document.getElementById("addPaymentMethodBtn")?.addEventListener(
    "click",
    openCreateModal
);

loadSettings();
loadPaymentMethods();
