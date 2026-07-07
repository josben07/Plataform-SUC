const API_URL =
    window.location.origin;

const SUPABASE_URL =
    "https://fjeopgtdmkkkukpksquk.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_9zCacif_AHBwD98E8GPuaw_-5Q5Y5FT";

function logoutUser(redirectTo) {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    Object.keys(localStorage)
        .filter(
            k => k.startsWith("sb-")
        )
        .forEach(
            k => localStorage.removeItem(k)
        );

    window.location.href =
        redirectTo ||
        "../pages/login.html";

}