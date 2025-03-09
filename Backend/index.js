console.clear(); // Limpia la consola al ejecutar cambios en tiempo real
// para init el server usar npm run dev
// para dejar de init el server con Crtl + c
const express = require('express');
const { Client } = require('pg');

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

app.get('/informacion', async (req, res) => {
    console.log("Alguien entró al servidor /informacion");
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