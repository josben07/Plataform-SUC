
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

            "http://localhost:3000/api/settings"

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

        "http://localhost:3000/api/settings",

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

loadSettings();