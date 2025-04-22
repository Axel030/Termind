console.clear(); // Limpia la consola al ejecutar cambios en tiempo real
const { error } = require('console');
// para init el server usar npm run dev
// para dejar de init el server con Crtl + c
const express = require('express');
const { Client } = require('pg');
const query = "SELECT * FROM Alumno"
const app = express();
const PORT = 3000;
app.use(express.json());
// para el caso de password siempre dejar vacia, por motivos de estetica
const client = new Client({
    user: 'postgres', // user default si no cambiar
    host: 'localhost',// host igualemte default 
    database: 'scolegio',// si la db tiene otro nombre cambiar 
    password: '1234',// siempre poner su password
    port: 5432// port es igual default si no cambiar
});
client.connect()
    .then(() => console.log("Conexión a la base de datos exitosa"))
    .catch(error => console.error("Error en la conexión a la base de datos", error));

app.get('/info', async (req, res) => {
    console.log("Alguien entró al servidor /informacion");
    res.send("HOLa gente")
    try {
        const result = await client.query('SELECT * FROM alumno');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error en la consulta", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});
app.listen(PORT, (error) => {
    if (!error) {
        console.log("server running ");
    } else {
        console.log("error server");
    }
});


const user_login =  async(req, res)=>{
    try{
        let{user, password } =  req.body
        const users = await client.query("SELECT usuario, contraseña FROM Usuarios WHERE usuario = $1",[user            
        ]);

        if(!users.rows.length === 1){
            res.status(409).json({
                error: "lo siento su usario no existe",
              });
        }
        else if(password == users.rows[0].contraseña){
                res.json({
                    message : "Inicio de sesion exitoso "
                })  
        }
        else{
            res.status(401).json({
                error : "Error al incio de sesion"
            })
        }
    } catch(error){
        console.log(error.message);
        res.status(500).json({
            error : error.message,
        });

    }
}
const validate = module.exports = (req, res, next) => {
    const { user, password } = req.body;
    if(req.path === "/login"){
        if(!user || !password){
            return res.status(400).json({
                error : "Faltan credenciales "
            });
        }
    }
    next();
}

app.post("/login", validate, user_login);
