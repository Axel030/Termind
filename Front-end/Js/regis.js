// Configuración del fondo de matrix
const canvas = document.querySelector('.matrix-background');
const ctx = canvas.getContext('2d');

// Asegurarse de que el canvas tenga el tamaño correcto de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array.from({ length: columns }).fill(1);

function drawMatrix() {
    // Esta línea hace que el efecto deje rastro, aumenta el valor de alpha para un efecto más pronunciado
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Color verde del estilo "matrix"
    ctx.fillStyle = '#00ff00';
    // Usar la fuente Press Start 2P para un look más retro
    ctx.font = fontSize + 'px "Press Start 2P", monospace';
    
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

// Ajustar el canvas cuando se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const newColumns = canvas.width / fontSize;
    
    // Ajustar el array de gotas si es necesario
    if (newColumns > drops.length) {
        const additionalDrops = Array.from({ length: newColumns - drops.length }).fill(1);
        drops.push(...additionalDrops);
    } else {
        drops.length = newColumns;
    }
});

setInterval(drawMatrix, 50);

// Manejo del formulario de registro
const form = document.getElementById('register-form');
const messageElement = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        messageElement.textContent = 'Las contraseñas no coinciden';
        messageElement.style.color = 'red';
        return;
    }
    
    // Validar longitud de la contraseña (debe tener al menos 8 caracteres según el servidor)
    if (password.length < 8) {
        messageElement.textContent = 'La contraseña debe tener al menos 8 caracteres';
        messageElement.style.color = 'red';
        return;
    }
    
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageElement.textContent = 'Usuario registrado exitosamente. Redirigiendo...';
            messageElement.style.color = '#0f0';
            
            // Redirigir al chat después de un registro exitoso
            setTimeout(() => {
                window.location.href = '/chat';
            }, 2000);
        } else {
            messageElement.textContent = data.error || 'Error al registrar usuario';
            messageElement.style.color = 'red';
        }
    } catch (error) {
        messageElement.textContent = 'Error de conexión. Inténtalo de nuevo.';
        messageElement.style.color = 'red';
        console.error('Error:', error);
    }
});