const jwt = require("jsonwebtoken")

function verifyToken(req, res, next){
    console.log(req.headers)
    try {
        const token = req.headers.authorization.split(" ")[1] //extraer el token del header

        const payload = jwt.verify(token, process.env.TOKEN_SECRET)
        //1. Valida que el token sea correcto
        //2. Nos devuelve el payload (la info del dueño del token)
        //3. causa un error si el token no es valido

        req.payload = payload //recoge el payloar del token y lo pasa a la ruta

        next() //continuar con la proxima ruta 
    } catch (error) {
        //si esta funcion entra en el catch, significa que el token no es valido
        res.status(401).json({errorMessage: "Token no válido o no existe"})
    }
    
}

module.exports = verifyToken