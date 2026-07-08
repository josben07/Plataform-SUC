const API_URL =
    window.location.origin;

const SUPABASE_URL =
    "https://fjeopgtdmkkkukpksquk.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_9zCacif_AHBwD98E8GPuaw_-5Q5Y5FT";

/* PATCH localStorage TO FALLBACK TO sessionStorage */
/* Allows "No, cerrar al salir" to use sessionStorage  */
/* without changing every file that reads token/user    */

(function () {

    const _getItem =
        localStorage.getItem
            .bind(localStorage);

    const _setItem =
        localStorage.setItem
            .bind(localStorage);

    const _removeItem =
        localStorage.removeItem
            .bind(localStorage);

    localStorage.getItem =
        function (key) {

            if (
                key === "token" ||
                key === "user"
            ) {

                const val =
                    _getItem(key);

                if (
                    val !== null
                ) return val;

                return sessionStorage
                    .getItem(key);

            }

            return _getItem(key);

        };

    localStorage.setItem =
        function (key, value) {

            if (
                key === "token" ||
                key === "user"
            ) {

                if (
                    _getItem(
                        "useSessionStorage"
                    ) === "true"
                ) {

                    sessionStorage
                        .setItem(
                            key,
                            value
                        );

                    return;

                }

            }

            _setItem(key, value);

        };

    localStorage.removeItem =
        function (key) {

            _removeItem(key);

        };

})();

function logoutUser(redirectTo) {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "keepSessionPending"
    );

    localStorage.removeItem(
        "useSessionStorage"
    );

    sessionStorage.removeItem(
        "token"
    );

    sessionStorage.removeItem(
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

/* ========================= */
/* KEEP SESSION MODAL */
/* ========================= */

function askKeepSession() {

    const pending =
        localStorage.getItem(
            "keepSessionPending"
        );

    if (!pending) return;

    localStorage.removeItem(
        "keepSessionPending"
    );

    /* OVERLAY */

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "keep-session-overlay";

    /* MODAL */

    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "keep-session-modal";

    modal.innerHTML =
        `
        <h3>
            ¿Desea mantener la sesión iniciada?
        </h3>

        <p>
            Si elige "No", su sesión se cerrará
            automáticamente al cerrar esta página.
        </p>

        <div class="keep-session-actions">

            <button
                class="keep-session-btn keep-session-yes"
                id="keepSessionYes"
            >
                Sí, mantener
            </button>

            <button
                class="keep-session-btn keep-session-no"
                id="keepSessionNo"
            >
                No, cerrar al salir
            </button>

        </div>
        `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    /* STYLES */

    const style =
        document.createElement(
            "style"
        );

    style.textContent =
        `
        .keep-session-overlay{
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.6);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:999999;
        }
        .keep-session-modal{
            background:#0F172A;
            border-radius:24px;
            padding:36px;
            max-width:420px;
            width:90%;
            text-align:center;
            color:white;
        }
        .keep-session-modal h3{
            font-size:1.3rem;
            margin-bottom:12px;
        }
        .keep-session-modal p{
            color:rgba(255,255,255,.62);
            font-size:.95rem;
            line-height:1.6;
            margin-bottom:28px;
        }
        .keep-session-actions{
            display:flex;
            flex-direction:column;
            gap:12px;
        }
        .keep-session-btn{
            height:50px;
            border:none;
            border-radius:14px;
            font-weight:700;
            font-size:.95rem;
            cursor:pointer;
            transition:.3s ease;
        }
        .keep-session-yes{
            background:linear-gradient(135deg,#6C4DFF,#8B7CFF);
            color:white;
        }
        .keep-session-yes:hover{
            transform:translateY(-2px);
            box-shadow:0 12px 30px rgba(108,77,255,.3);
        }
        .keep-session-no{
            background:rgba(255,255,255,.08);
            color:white;
        }
        .keep-session-no:hover{
            background:rgba(255,255,255,.14);
        }
        `;

    document.head.appendChild(style);

    /* HANDLERS */

    document.getElementById(
        "keepSessionYes"
    ).addEventListener(
        "click",
        () => {

            document.body.removeChild(
                overlay
            );

        }
    );

    document.getElementById(
        "keepSessionNo"
    ).addEventListener(
        "click",
        () => {

            const token =
                localStorage
                    .getItem("token");

            const user =
                localStorage
                    .getItem("user");

            if (token) {

                sessionStorage
                    .setItem(
                        "token",
                        token
                    );

                sessionStorage
                    .setItem(
                        "user",
                        user
                    );

            }

            localStorage
                .removeItem("token");

            localStorage
                .removeItem("user");

            localStorage
                .setItem(
                    "useSessionStorage",
                    "true"
                );

            document.body.removeChild(
                overlay
            );

        }
    );

}