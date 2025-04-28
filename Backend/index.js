console.clear(); // Limpia la consola al ejecutar cambios en tiempo real
const { error } = require('console');
// para init el server usar npm run dev
// para dejar de init el server con Crtl + c
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const express = require('express');
const { Client } = require('pg');
const query = "SELECT * FROM Alumno"
const app = express();
const PORT = 3000;
app.use(express.json());
require('dotenv').config();
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'Front-end')));
// para el caso de password siempre dejar vacia, por motivos de estetica
const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'scolegio',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 5432
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Front-end', 'Html', 'index.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Front-end', 'Html', 'Chat_Pixel.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Front-end', 'Html', 'Registrar.html'));
});

// Llama a esta función después de conectar a la base de datos
client.connect()
    .then(async () => {
        console.log("Conexión a la base de datos exitosa");
        await initializeDatabase();
        
        app.listen(PORT, (error) => {
            if (!error) {
                console.log("Servidor ejecutándose en el puerto", PORT);
            } else {
                console.log("Error al iniciar el servidor:", error);
            }
        });
    })
    .catch(error => console.error("Error en la conexión a la base de datos", error));

    



// login funcion
const user_login = async(req, res) => {
    try {
        let { user, password } = req.body;
        const users = await client.query("SELECT usuario, contraseña FROM Usuario WHERE usuario = $1", [user]);

        if(users.rows.length === 0) {
            return res.status(409).json({
                error: "Lo siento, el usuario no existe",
            });
        }
        else if(password === users.rows[0].contraseña) {
            return res.json({
                message: "Inicio de sesión exitoso"
            });  
        }
        else {
            return res.status(401).json({
                error: "Error al inicio de sesión: contraseña incorrecta"
            });
        }
    } catch(error) {
        console.log("Error en login:", error.message);
        return res.status(500).json({
            error: error.message,
        });
    }
};

//funcion register
const register_user = async (req, res) => {
    try {
        let { user, password } = req.body;
        
        // Verificar si el usuario ya existe
        const userCheck = await client.query("SELECT usuario FROM Usuario WHERE usuario = $1", [user]);
        
        if (userCheck.rows.length > 0) {
            return res.status(409).json({
                error: "El usuario ya existe, elija otro nombre de usuario"
            });
        }
        
        // Insertar el nuevo usuario en la base de datos
        const newUser = await client.query(
            "INSERT INTO Usuario (usuario, contraseña) VALUES ($1, $2) RETURNING *", 
            [user, password]
        );
        
        res.status(201).json({
            message: "Usuario registrado exitosamente",
            user: newUser.rows[0].usuario
        });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};
//validate login
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
//validate register
const validateRegister = (req, res, next) => {
    const { user, password } = req.body;
    
    if (!user || !password) {
        return res.status(400).json({
            error: "Debe proporcionar un usuario y contraseña"
        });
    }
    

    if (password.length < 8) {
        return res.status(400).json({
            error: "La contraseña debe tener al menos 8 caracteres"
        });
    }
    
    next();
};

async function initializeDatabase() {
    try {
        // Check existing tables
        const tableCheck = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        );
        console.log("Tablas existentes en la base de datos:", tableCheck.rows);
        
        // Create Usuario table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Usuario" (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                contraseña VARCHAR(100) NOT NULL
            );
        `);
        
        // Create Alumno table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Alumno" (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                apellido VARCHAR(50) NOT NULL,
                edad INT,
                grado VARCHAR(20),
                usuario_id INT REFERENCES "Usuario"(id)
            );
        `);
        
        console.log("Tablas verificadas/creadas exitosamente");
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
        throw error;
    }
}



// Endpoint para verificar el estado del servidor
app.get('/api/status', (req, res) => {
    res.json({ status: 'online' });
});

// Endpoint para manejar mensajes de chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }
        
        // Aquí puedes implementar la lógica para conectar con OpenAI
        // Por ahora, haremos una respuesta simple
        res.json({ 
            response: "Lo siento, la funcionalidad de chat aún está en desarrollo. Puedes probar la consulta a la base de datos usando palabras clave como 'busca', 'consulta', 'alumnos', etc."
        });
        
    } catch (error) {
        console.error('Error al procesar el mensaje de chat:', error);
        res.status(500).json({ 
            error: 'Error procesando el mensaje',
            details: error.message
        });
    }
});

// Endpoint para consultas a la base de datos
app.post('/api/db-query', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'La pregunta es requerida' });
        }
        
        // 1. Generar la consulta SQL con OpenAI
        const sqlQueryResponse = await generateSQLQuery(question);
        
        // 2. Ejecutar la consulta en la base de datos
        const dbResponse = await executeSQLQuery(sqlQueryResponse.query);
        
        // 3. Devolver todos los resultados
        res.json({
            query: sqlQueryResponse.query,
            tokens: sqlQueryResponse.tokens,
            results: dbResponse
        });
    } catch (error) {
        console.error('Error en la consulta a la base de datos:', error);
        res.status(500).json({ 
            error: 'Error procesando la consulta',
            details: error.message
        });
    }
});

// Función para generar consulta SQL usando OpenAI
async function generateSQLQuery(question) {
    const systemPrompt = `
Genera EXCLUSIVAMENTE una consulta PostgreSQL válida basada en la pregunta.
Tablas disponibles:
- "usuarios" (columnas: id (integer), usuario (character varying(20)), nombre (character varying(20)), contraseña (character varying(20)), edad (integer), pais (character varying(50)), genero (character(1)), estado (character(1)), fecharegistro (date))
- "Alumno" (columnas: id, nombre, apellido, edad, grado, usuario_id)
- "alumno" (columnas: id, nombre, apellido, edad, grado, usuario_id)
- "curso" (columnas: id, nombre, descripcion, codigo, profesor_id)
- "matricula" (columnas: id, alumno_id, curso_id, fecha, estado)
- "profesor" (columnas: id, nombre, apellido, especialidad, email)
- "datos_carro" (columnas: id, marca, modelo, año, placa, propietario_id)
- "prueba_date" (columnas: id, fecha, descripcion)
- "ruta" (columnas: id, nombre, origen, destino, distancia)

Instrucciones:
- Solo el código SQL, sin explicaciones ni comentarios
- Usar comillas dobles para identificadores (ej: SELECT * FROM "Usuario")
- No incluyas texto fuera de la consulta, solo se quiere exclusivamente la consulta.
- Si te solicitan información de una tabla y hay varias con el mismo propósito pero diferente nombre (como "Usuario", "usuario" y "usuarios"), intenta usar la que parece más relevante según el contexto.
- Si la consulta hace referencia a alumnos o estudiantes, usa la tabla "Alumno" o "alumno".
`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0,
                max_tokens: 150
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );
        
        // Extraer la respuesta y procesar para obtener solo la consulta SQL
        const content = response.data.choices[0].message.content.trim();
        
        // Usar regex para extraer solo la consulta SQL
        const sqlRegex = /^SELECT.*?(?:;|$)/is;
        const sqlMatch = content.match(sqlRegex);
        const sqlQuery = sqlMatch ? sqlMatch[0].trim() : "SELECT * FROM \"Alumno\" LIMIT 5;";
        
        // Calcular los tokens y el costo
        const promptTokens = response.data.usage.prompt_tokens;
        const completionTokens = response.data.usage.completion_tokens;
        const totalTokens = response.data.usage.total_tokens;
        
        
        return {
            query: sqlQuery,
            tokens: {
                prompt: promptTokens,
                completion: completionTokens,
                total: totalTokens
            },
            
        };
    } catch (error) {
        throw new Error(`Error generando consulta SQL: ${error.message}`);
    }
}
// Función para ejecutar la consulta SQL en la base de datos
async function executeSQLQuery(query) {
    try {
        // Validar que la consulta comience con SELECT para evitar operaciones peligrosas
        if (!query.trim().toUpperCase().startsWith('SELECT')) {
            throw new Error('Solo se permiten consultas SELECT por razones de seguridad');
        }
        
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw new Error(`Error ejecutando la consulta en la base de datos: ${error.message}`);
    }
}

// Función para calcular el costo de la consulta


app.post("/login", validate, user_login);
app.post("/register", validateRegister, register_user);
module.exports = { validate };