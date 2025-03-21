const User = require("../models/User.model");

const router = require("express").Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/auth.middlewares")

//POST "/api/auth/signup" => ruta para crear documento de usuario
//Atento a prefijos
router.post("/signup", async (req, res, next) => {
  //Validaciones de Servidor
  const { email, username, password } = req.body;

  //verificar que los valores existen
  if (!email || !username || !password) {
    res
      .status(400)
      .json({ errorMessage: "Todos los campos son obligatorios." });
    return; //detener la ejecucion de la funcion
  }

  //que el nombre de usuario tenga minimo 3 caracteres TAREA
  //que el usuario no incluya caracteres especiales TAREA

  //que el password sea fuerte
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (passwordRegex.test(password) === false) {
    res.status(400).json({
      errorMessage:
        "La contraseña no es fuerte. Requiere 1 Mayus, 1 Minus, 1 Num y 8 caracteres en total.",
    });
    return; //detener la ejecucion de la funcion
  }

  //que el email tenga el formato correcto TAREA

  try {
    //que el email no se repita
    const foundUser = await User.findOne({ email: email });
    console.log(foundUser);

    if (foundUser !== null) {
      res
        .status(400)
        .json({ errorMessage: "Ya existe un usuario con este correo" });
      return; //detener la ejecucion de la funcion
    }

    const hashPassword = await bcrypt.hash(password, 12);

    await User.create({
      email: email,
      username: username,
      password: hashPassword,
    });

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
});

//POST "/api/auth/login" => Ruta para validar credenciales del usuario y crear el token
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  //que los campos existan
  if (!email || !password) {
    res.status(400).json({ errorMessage: "Todos los campos son obligatorios" });
    return;
  }
  //que el email tenga el formato correcto TAREA

  //que pueda hacer login con el correo electronico o el usuario (si fuese unico) OPCIONAL

  try {
    //que el usuario exista con ese email
    const foundUser = await User.findOne({ email: email });
    if (foundUser === null) {
      res
        .status(400)
        .json({ errorMessage: "Usuario no encontrado con ese correo." });
      return;
    }
    //que la contraseña corresponda con la almacenada
    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );
    if (isPasswordCorrect === false) {
      res.status(400).json({ errorMessage: "Contraseña no valida" });
      return;
    }
    //HEMOS AUTENTICADO AL USUARIO
    //creamos el token y lo enviamos al cliente

    const payload = {
        _id: foundUser._id,
        email: foundUser.email,
        //si tuviermos roles, tambien tendrian que ir aquí
    }//el payload es la informacion unica del usuario que lo identifica, estará dentro del token
    
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, { algorithm:"HS256", expiresIn: "7d" })
    res.status(200).json({authToken:authToken})
  } catch (error) {
    next(error);
  }
});
//GET "/api/auth/verify" => Verficar validez del token e indicar a la aplicacion que el usuario fue identificado

router.get("/verify", verifyToken, (req, res) => {

    //tenemos que validar el token. Lo validamos con el midleware verifyToken
    //! CON EL REQ.PAYLOAD EL SERVIDOR SABE QUIEN ES EL USUARIO QUE ESTA HACIENDO LAS ACCIONES
    console.log(req.payload)

    res.status(200).json({payload:req.payload})//!indicar al FE que el usuario fue valido recientemente y EL FRONTEND RECIBE INFO DE QUIEN ES EL USUARIO
})

//EJEMPLO DE RUTA PRIVADA SOLO ACCESIBLE PARA USUARIOS LOGEADOS
router.get("/crear-una-banana", verifyToken, (req, res) =>{
    //Banana.create(...)

    console.log(req.payload._id) //nos dice el id del usuario que esta creando la banana
    res.status(201).json("has creado una banana")
})

module.exports = router;
