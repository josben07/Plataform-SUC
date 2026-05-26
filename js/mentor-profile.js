
const appToast =
    document.querySelector(".app-toast");

const appToastMessage =
    document.getElementById("appToastMessage");

function showToast(message) {

    if (!appToast || !appToastMessage) return;

    appToastMessage.textContent =
        message;

    appToast.classList.add("show-toast");

    setTimeout(() => {
        appToast.classList.remove("show-toast");
    }, 3000);

}

const user =
    JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "mentor") {

    window.location.href =
        "../login.html";

}

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const fullName =
    document.getElementById("fullName");

const email =
    document.getElementById("email");

const profileForm =
    document.getElementById("profileForm");

profileAvatar.textContent =
    user.full_name.charAt(0);

profileName.textContent =
    user.full_name;

profileEmail.textContent =
    user.email;

fullName.value =
    user.full_name;

email.value =
    user.email;

profileForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    await fetch(
        `${API_URL}/api/users/${user.id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({
                    full_name:
                        fullName.value,

                    role:
                        user.role,

                    status:
                        user.status || "active"
                })
        }
    );

    user.full_name =
        fullName.value;

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    profileName.textContent =
        fullName.value;

    profileAvatar.textContent =
        fullName.value.charAt(0);

    showToast("Perfil actualizado correctamente");

});