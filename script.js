// ==============================
// 🔹 CONFIGURACIÓN THINGSPEAK
// ==============================

const CHANNEL_ID = "3354064";
const READ_API_KEY = "XXI2FHM09C5VYWJC";

// ==============================
// 🔹 OBTENER DATOS REALES
// ==============================

async function obtenerDatosThingSpeak() {
    try {
        const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1&api_key=${READ_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        const feed = data.feeds[0];

        if (!feed || !feed.field1) {
            console.warn("Sin datos en ThingSpeak");
            return;
        }

        const humedad = parseInt(feed.field1);
        actualizarDashboardReal(humedad, feed.created_at);

    } catch (error) {
        console.error("Error ThingSpeak:", error);
    }
}

// ==============================
// 🔹 ACTUALIZAR DASHBOARD REAL
// ==============================

function actualizarDashboardReal(hum, fecha) {

    document.getElementById('humedadLive').innerText = `${hum}%`;

    let estado = '';
    let badgeContent = '';

    if (hum < 48) {
        estado = 'Seco crítico';
        badgeContent = '<i class="fas fa-exclamation-triangle"></i> Alerta roja';
    } else if (hum < 60) {
        estado = 'Moderado';
        badgeContent = '<i class="fas fa-tint"></i> Precaución';
    } else if (hum <= 75) {
        estado = 'Húmedo';
        badgeContent = '<i class="fas fa-check-circle"></i> Óptimo';
    } else {
        estado = 'Muy húmedo';
        badgeContent = '<i class="fas fa-water"></i> Exceso de riego';
    }

    document.getElementById('estadoLive').innerText = estado;
    document.getElementById('badgeLive').innerHTML = badgeContent;

    // Hora real desde ThingSpeak
    const lectura = new Date(fecha);

    document.getElementById("lastLive").innerText =
        lectura.toLocaleTimeString();
}

// ==============================
// 🔹 BARRAS (SIGUEN SIMULADAS)
// ==============================

function randomHumedad() {
    return Math.floor(Math.random() * (84 - 44 + 1) + 44);
}
async function renderColorfulBars() {

    const container = document.getElementById('colorfulBars');
    if (!container) return;

    try {
        const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=10&api_key=${READ_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        const feeds = data.feeds;

        container.innerHTML = '';

        feeds.forEach(feed => {
            const valor = parseInt(feed.field1);
            if (isNaN(valor)) return;

            const hora = new Date(feed.created_at)
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const altura = Math.min(150, valor * 1.5);

            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '70px';

            const bar = document.createElement('div');
            bar.className = 'bar-neon';
            bar.style.height = `${altura}px`;
            bar.style.width = '48px';
            bar.style.display = 'flex';
            bar.style.alignItems = 'flex-end';
            bar.style.justifyContent = 'center';
            bar.style.paddingBottom = '8px';
            bar.style.fontSize = '0.7rem';
            bar.style.color = '#fff';
            bar.innerText = `${valor}%`;

            const label = document.createElement('div');
            label.style.fontSize = '0.7rem';
            label.style.marginTop = '8px';
            label.style.color = '#cbd5f0';
            label.innerText = hora;

            wrapper.appendChild(bar);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        });

    } catch (error) {
        console.error("Error cargando gráfico:", error);
    }
}

// ==============================
// 🔹 INICIO DEL SISTEMA
// ==============================

document.addEventListener('DOMContentLoaded', () => {

    // Cargar datos reales
    obtenerDatosThingSpeak();

    // Actualizar cada 15s (ThingSpeak límite)
    setInterval(obtenerDatosThingSpeak, 15000);

    // Barras cada 10s (simulación visual)
    renderColorfulBars();
    setInterval(() => {
        obtenerDatosThingSpeak();
        renderColorfulBars();
    }, 15000);
});