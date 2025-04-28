// Animación de fondo tipo Matrix
const toggleMenu = document.getElementById('toggleMenu');
const menu = document.getElementById('menu');
const chatContainer = document.querySelector('.chat-container');

toggleMenu.addEventListener('click', () => {
  menu.classList.toggle('open');
  chatContainer.classList.toggle('open');
});
const canvas = document.querySelector('.matrix-background');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array.from({ length: columns }).fill(1);
let color = "blue";

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0F0';
    ctx.fillStyle= color;
    ctx.font = fontSize + 'px "Press Start 2P"';
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

setTimeout(() => {
    document.body.style.color = "#00ff00"; // Color final
}, 7000); 

// Espera 3 segundos antes de cambiar
setTimeout(() => {
    color = "#00ff00"; // Cambio a verde Matrix
}, 6000);

// Función para comunicarse con ChatGPT
async function sendMessageToChatGPT(userMessage) {
    try {
        const chatBox = document.getElementById('chat-box');
        
        // Crear indicador de carga
        const loadingElement = document.createElement('p');
        loadingElement.className = 'bot-message loading';
        loadingElement.textContent = 'Termid está pensando...';
        chatBox.appendChild(loadingElement);
        
        // Desplazar chat hacia abajo
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Enviar mensaje a la API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });
        
        // Procesar respuesta
        const data = await response.json();
        
        // Eliminar indicador de carga
        chatBox.removeChild(loadingElement);
        
        // Crear y agregar la respuesta del bot
        const botMessageElement = document.createElement('p');
        botMessageElement.className = 'bot-message';
        botMessageElement.textContent = data.response;
        chatBox.appendChild(botMessageElement);
        
        // Desplazar chat hacia abajo
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error al comunicarse con la API:', error);
        
        // Eliminar indicador de carga si existe
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            chatBox.removeChild(loadingElement);
        }
        
        // Mostrar mensaje de error
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.textContent = 'Error al comunicarse con el asistente. Intenta de nuevo más tarde.';
        chatBox.appendChild(errorElement);
        
        // Desplazar chat hacia abajo
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Función para enviar consultas a la base de datos
async function sendDatabaseQuery(userMessage) {
    try {
        const chatBox = document.getElementById('chat-box');
        
        // Crear indicador de carga
        const loadingElement = document.createElement('p');
        loadingElement.className = 'bot-message loading';
        loadingElement.textContent = 'Consultando la base de datos...';
        chatBox.appendChild(loadingElement);
        
        // Desplazar chat hacia abajo
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Enviar mensaje a la API para consulta de BD
        const response = await fetch('/api/db-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: userMessage })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        // Procesar respuesta
        const data = await response.json();
        
        // Eliminar indicador de carga
        chatBox.removeChild(loadingElement);
        
        // Crear y agregar la respuesta
        const botMessageElement = document.createElement('p');
        botMessageElement.className = 'bot-message';
        
        // Formatear la respuesta de manera legible
        let formattedResponse = `🔍 Consulta generada: ${data.query}\n\n`;
        //formattedResponse += `📊 Tokens usados: ${data.tokens.total} (Prompt: ${data.tokens.prompt}, Respuesta: ${data.tokens.completion})\n\n`;
        formattedResponse += `🤖 Resultados:\n`;
        
        // Formatear los resultados de la base de datos
        if (Array.isArray(data.results) && data.results.length > 0) {
            // Convertir resultados a formato tabular para mejor visualización
            const keys = Object.keys(data.results[0]);
            formattedResponse += keys.join(' | ') + '\n';
            formattedResponse += '-'.repeat(keys.join(' | ').length) + '\n';
            
            data.results.forEach(row => {
                const values = keys.map(key => row[key] !== null ? row[key] : 'NULL');
                formattedResponse += values.join(' | ') + '\n';
            });
        } else {
            formattedResponse += 'No se encontraron resultados.';
        }
        
        // Reemplazar saltos de línea con <br> para HTML
        botMessageElement.innerHTML = formattedResponse.replace(/\n/g, '<br>');
        chatBox.appendChild(botMessageElement);
        
        // Desplazar chat hacia abajo
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        
        // Eliminar indicador de carga si existe
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            chatBox.removeChild(loadingElement);
        }
        
        // Mostrar mensaje de error
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.textContent = `Error al consultar la base de datos: ${error.message}`;
        chatBox.appendChild(errorElement);
        
        // Desplazar chat hacia abajo
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Funcionalidad del chat - Actualizada para detectar consultas a la base de datos
document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message !== '') {
        const chatBox = document.getElementById('chat-box');
        
        // Crear y agregar mensaje del usuario
        const userMessageElement = document.createElement('p');
        userMessageElement.className = 'user-message';
        userMessageElement.textContent = message;
        chatBox.appendChild(userMessageElement);
        
        // Limpiar input
        input.value = '';
        
        // Desplazar chat hacia abajo
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Determinar si es una consulta a la base de datos o una pregunta general
        const dbKeywords = [
            'busca', 'consulta', 'muestra', 'lista', 'dame', 'encuentra', 
            'alumnos', 'alumno', 'estudiante', 'estudiantes', 
            'usuarios', 'usuario', 'user', 
            'base de datos', 'sql', 'select', 'db', 'query'
        ];
        
        const isDbQuery = dbKeywords.some(keyword => message.toLowerCase().includes(keyword));
        
        if (isDbQuery) {
            // Enviar consulta a la base de datos
            sendDatabaseQuery(message);
        } else {
            // Enviar mensaje a ChatGPT normal
            sendMessageToChatGPT(message);
        }
    }
});

// Manejo de errores para el caso de que la API no esté disponible
window.addEventListener('load', () => {
    // Verificar estado del servidor al cargar la página
    fetch('/api/status', { method: 'GET' })
        .catch(error => {
            console.error('No se pudo establecer conexión con el servidor:', error);
            const chatBox = document.getElementById('chat-box');
            
            // Agregar mensaje de error
            const serverErrorElement = document.createElement('p');
            serverErrorElement.className = 'error-message system';
            serverErrorElement.textContent = 'No se pudo establecer conexión con el servidor. Algunas funcionalidades pueden no estar disponibles.';
            
            if (chatBox) {
                chatBox.appendChild(serverErrorElement);
            }
        });
});

// Enviar mensaje al presionar Enter
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('send-btn').click();
    }
});