// Animación de fondo tipo Matrix
const toggleMenu = document.getElementById('toggleMenu');
const menu = document.getElementById('menu');
const chatContainer = document.getElementById('chatContainer');

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

// Funcionalidad del chat
document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    if (input.value.trim() !== '') {
        const chatBox = document.getElementById('chat-box');
        const message = document.createElement('p');
        message.textContent = input.value;
        chatBox.appendChild(message);
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
setTimeout(() => {
    document.body.style.color = "#00ff00"; // Color final

}, 7000); 

// Espera 3 segundos antes de cambiar
setTimeout(() => {
    color = "#00ff00"; // Cambio a verde Matrix
}, 6000);
