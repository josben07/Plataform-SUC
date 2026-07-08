const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const supabase =
require("../config/supabase");

/* ========================= */
/* REGISTER */
/* ========================= */

exports.register = async (req, res) => {

    try{

        const {

            full_name,
            email,
            password

        } = req.body;

        /* VALIDATION */

        if(
            !full_name ||
            !email ||
            !password
        ){

            return res.status(400).json({

                error:
                "Todos los campos son obligatorios"

            });

        }

        /* CHECK USER */

        const { data: existingUser } =
        await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

        if(existingUser){

            return res.status(400).json({

                error:
                "El usuario ya existe"

            });

        }

        /* HASH PASSWORD */

        const hashedPassword =
        await bcrypt.hash(password, 10);

        /* INSERT USER */

        const {

            data,
            error

        } = await supabase
        .from("users")
        .insert([{

            full_name,

            email,

            password: hashedPassword,

            role: "student"

        }])
        .select();

        if(error){

            return res.status(400).json(error);

        }

        res.status(201).json({

            message:
            "Usuario registrado",

            user: data[0]

        });

    }catch(err){

        res.status(500).json({

            error: err.message

        });

    }

};

/* ========================= */
/* VERIFY TOKEN */
/* ========================= */

exports.verify = async (req, res) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                error:
                    "Token requerido"

            });

        }

        const token =
            authHeader.split(
                " "
            )[1];

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const {
            data: user
        } =
            await supabase
                .from("users")
                .select("*")
                .eq(
                    "id",
                    decoded.id
                )
                .single();

        if (!user) {

            return res.status(404).json({

                error:
                    "Usuario no encontrado"

            });

        }

        if (
            user.status ===
            "blocked"
        ) {

            return res.status(403).json({

                error:
                    "Cuenta bloqueada"

            });

        }

        res.json({

            valid: true,

            user: {

                id: user.id,

                full_name:
                    user.full_name,

                email:
                    user.email,

                role:
                    user.role

            }

        });

    } catch (err) {

        res.status(401).json({

            valid: false,

            error:
                "Token inválido"

        });

    }

};

/* ========================= */
/* GOOGLE LOGIN */
/* ========================= */

exports.googleLogin = async (req, res) => {

    try {

        const {

            accessToken

        } = req.body;

        if (!accessToken) {

            return res.status(400).json({

                error:
                    "Token de acceso requerido"

            });

        }

        /* VERIFY WITH SUPABASE */

        const {

            data:
            { user: supabaseUser },

            error: verifyError

        } =
            await supabase.auth.getUser(
                accessToken
            );

        if (
            verifyError ||
            !supabaseUser
        ) {

            return res.status(401).json({

                error:
                    "Token de Google inválido"

            });

        }

        const email =
            supabaseUser.email;

        const full_name =
            supabaseUser.user_metadata
                ?.full_name ||
            supabaseUser.user_metadata
                ?.name ||
            "Usuario";

        /* FIND OR CREATE USER */

        const {
            data: existingUser
        } =
            await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

        let user;

        if (existingUser) {

            if (
                existingUser.status ===
                "blocked"
            ) {

                return res.status(403).json({

                    error:
                        "Tu cuenta esta bloqueada. Contacta al administrador."

                });

            }

            user = existingUser;

        } else {

            const {
                data: newUser,
                error: insertError
            } =
                await supabase
                    .from("users")
                    .insert([{

                        full_name,

                        email,

                        password: "",

                        role: "student"

                    }])
                    .select();

            if (insertError) {

                return res.status(400).json(
                    insertError
                );

            }

            user = newUser[0];

        }

        /* GENERATE TOKEN */

        const token =
            jwt.sign(

                {

                    id: user.id,
                    role: user.role

                },

                process.env.JWT_SECRET,

                {

                    expiresIn: "7d"

                }

            );

        res.json({

            message:
                "Login exitoso",

            token,

            user: {

                id: user.id,

                full_name:
                    user.full_name,

                email:
                    user.email,

                role:
                    user.role

            }

        });

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

};

/* ========================= */
/* LOGIN */
/* ========================= */

exports.login = async (req, res) => {

    try{

        const {

            email,
            password

        } = req.body;

        /* FIND USER */

        const {

            data: user,
            error

        } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

        if(error || !user){

            return res.status(400).json({

                error:
                "Usuario no encontrado"

            });

        }

        if (user.status === "blocked") {

            return res.status(403).json({

                error:
                "Tu cuenta esta bloqueada. Contacta al administrador."

            });

        }

        if (!user.password) {

            return res.status(400).json({

                error:
                "Esta cuenta fue creada con Google. Inicia sesión con Google."

            });

        }

        /* COMPARE PASSWORD */

        const validPassword =
        await bcrypt.compare(

            password,
            user.password

        );

        if(!validPassword){

            return res.status(400).json({

                error:
                "Contraseña incorrecta"

            });

        }

        /* TOKEN */

        const token =
        jwt.sign(

            {

                id: user.id,
                role: user.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        res.json({

            message:
            "Login exitoso",

            token,

            user: {

                id: user.id,

                full_name:
                user.full_name,

                email:
                user.email,

                role:
                user.role

            }

        });

    }catch(err){

        res.status(500).json({

            error: err.message

        });

    }

};
