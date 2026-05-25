const path = require("path");

const studentMentorsRoutes =
    require("./src/routes/student-mentors.routes");

const studentCoursesRoutes =
    require(
        "./src/routes/student-courses.routes"
    );

const studentRoutes =
    require("./src/routes/student.routes");

const progressRoutes =
    require("./src/routes/progress.routes");

const dashboardRoutes =
    require("./src/routes/dashboard.routes");

const settingsRoutes =
    require("./src/routes/settings.routes");

const paymentsRoutes =
    require("./src/routes/payments.routes");

const mentorRoutes =
    require("./src/routes/mentor.routes");

const projectsRoutes =
    require("./src/routes/projects.routes");

const resourcesRoutes =
    require("./src/routes/resources.routes");

const lessonsRoutes =
require(
    "./src/routes/lessons.routes"
);

const modulesRoutes =
require(
    "./src/routes/modules.routes"
);

const express =
require("express");

const cors =
require("cors");

require("dotenv").config();

/* EXPRESS */

const app =
express();

/* MIDDLEWARES */

app.use(cors());

app.use(express.json());

/* ROUTES */

const authRoutes =
require("./src/routes/authRoutes");

const usersRoutes =
require("./src/routes/users.routes");

const coursesRoutes =
require("./src/routes/courses.routes");

/* CONFIG */

const supabase =
require("./src/config/supabase");

/* API ROUTES */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    usersRoutes
);

app.use(
    "/api/courses",
    coursesRoutes
);

app.use(
    "/api/modules",
    modulesRoutes
);

app.use(
    "/api/lessons",
    lessonsRoutes
);

app.use(
    "/api/resources",
    resourcesRoutes
);

app.use(
    "/api/projects",
    projectsRoutes
);

app.use(
    "/api/mentor",
    mentorRoutes
);

app.use(
    "/api/payments",
    paymentsRoutes
);

app.use(
    "/api/settings",
    settingsRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/progress",
    progressRoutes
);

app.use(
    "/api/student",
    studentRoutes
);

app.use(
    "/api/student-courses",
    studentCoursesRoutes
);

app.use(
    "/api/student-mentors",
    studentMentorsRoutes
);

app.use("/css", express.static(path.join(__dirname, "../css")));
app.use("/js", express.static(path.join(__dirname, "../js")));
app.use("/pages", express.static(path.join(__dirname, "../pages")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

/* HOME */

app.get("/", (req,res) => {

    res.json({

        message:
        "SUClassroom backend funcionando 🚀"

    });

});

/* TEST DATABASE */

app.get("/test-db", async (req,res) => {

    try{

        const {

            data,
            error

        } = await supabase

        .from("users")

        .select("*");

        if(error){

            return res.status(400).json(error);

        }

        res.json(data);

    }catch(err){

        res.status(500).json({

            error:
            err.message

        });

    }

});

/* PORT */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(

        `Servidor corriendo en puerto ${PORT}`

    );

});