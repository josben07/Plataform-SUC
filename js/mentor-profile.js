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

/* BASIC PROFILE */

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

/* PROFESSIONAL PROFILE */

const photoUrl =
    document.getElementById("photoUrl");

const position =
    document.getElementById("position");

const company =
    document.getElementById("company");

const experienceYears =
    document.getElementById("experienceYears");

const specialties =
    document.getElementById("specialties");

const description =
    document.getElementById("description");

const areas =
    document.getElementById("areas");

/* SET USER DATA */

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

/* LOAD MENTOR PROFESSIONAL PROFILE */

async function loadMentorProfile() {

    const response =
        await fetch(
            `${API_URL}/api/mentor-profiles`
        );

    const mentors =
        await response.json();

    const currentMentor =
        mentors.find(
            mentor =>
                mentor.id === user.id
        );

    if (!currentMentor || !currentMentor.profile) {

        return;

    }

    const profile =
        currentMentor.profile;

    photoUrl.value =
        profile.photo_url || "";

    position.value =
        profile.position || "";

    company.value =
        profile.company || "";

    experienceYears.value =
        profile.experience_years || "";

    specialties.value =
        profile.specialties || "";

    description.value =
        profile.description || "";

    areas.value =
        profile.areas || "";

}

/* SAVE PROFILE */

profileForm.addEventListener(
    "submit",
    async (e) => {

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

                        user_id:
                            user.id,

                        photo_url:
                            photoUrl.value,

                        position:
                            position.value,

                        company:
                            company.value,

                        experience_years:
                            experienceYears.value,

                        specialties:
                            specialties.value,

                        description:
                            description.value,

                        areas:
                            areas.value

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

        showToast(
            "Perfil actualizado correctamente"
        );

    }
);

/* INIT */

loadMentorProfile();