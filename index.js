console.clear(); //a los que veran temas de servidores, es para que se limpie la consola en caso de guradar cambios en tiempo real
const express = require('express'); 
const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/informacion', (req, res)=>{
res.status(200);
res.send("Bienvenidos, a mi server express");
console.log("alguien entro al server informacion");
});

app.listen(PORT, (error) =>
{
    if(!error)
    {
        console.log("server is running");
        
    }
    else{
        console.log("Error is server");
    }
});

