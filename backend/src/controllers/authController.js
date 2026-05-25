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