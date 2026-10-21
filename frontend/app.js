// Configuración de la API
// En local (archivo o servidor estático con puerto) el backend corre en el puerto 8000;
// desplegado, el API comparte dominio con el frontend.
const API_URL = (window.location.protocol === 'file:' || window.location.port)
    ? `http://${window.location.hostname || '127.0.0.1'}:8000/api/compatibilidad`
    : '/api/compatibilidad';

// Colores por nivel de compatibilidad (más oscuros que los del backend para que se lean sobre blanco)
const COLOR_NIVEL = {
    'Excelente': '#2f9e5a',
    'Buena': '#5f9f2a',
    'Moderada': '#a86a00',
    'Baja': '#d35f00',
    'Muy Baja': '#d62f2f'
};

function colorPorPuntaje(score) {
    if (score >= 85) return COLOR_NIVEL['Excelente'];
    if (score >= 70) return COLOR_NIVEL['Buena'];
    if (score >= 55) return COLOR_NIVEL['Moderada'];
    if (score >= 40) return COLOR_NIVEL['Baja'];
    return COLOR_NIVEL['Muy Baja'];
}

const DIMENSIONES = [
    'comunicacion', 'valores', 'conflicto', 'estilo_emocional',
    'tiempo_compartido', 'intimidad', 'metas_futuro', 'apoyo_mutuo'
];

const esMovil = () => window.matchMedia('(max-width: 600px)').matches;
const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Variables globales para los gráficos
let radarChart = null;
let barChart = null;

// Crear corazones flotantes
function createFloatingHearts() {
    if (reducirMovimiento()) return;
    const container = document.getElementById('floatingHearts');
    const heartSymbols = ['♥', '❤', '💕', '💖'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        
        container.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 15000);
    }, 3000);
}

// Estado del formulario
let personaActual = 'A';
let datosPersonaA = {};
let datosPersonaB = {};

function leerPersona(prefix, formData) {
    const datos = {};
    DIMENSIONES.forEach(dim => {
        datos[dim] = parseFloat(formData.get(`${prefix}_${dim}`));
    });
    return datos;
}

function actualizarPaso(n) {
    document.getElementById('step-indicator').innerHTML =
        `<span class="step-dot on"></span><span class="step-dot ${n >= 2 ? 'on' : ''}"></span>` +
        `<span class="step-text">Paso ${n} de 2 · Persona ${n}</span>`;
}

// Funciones de navegación
function mostrarFormulario() {
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('formulario-section').style.display = 'block';
    personaActual = 'A';
    datosPersonaA = {};
    datosPersonaB = {};
    mostrarPersonaA();
    window.scrollTo(0, 0);
}

function volverInicio() {
    // Destruir gráficos si existen
    if (radarChart) {
        radarChart.destroy();
        radarChart = null;
    }
    if (barChart) {
        barChart.destroy();
        barChart = null;
    }
    
    document.getElementById('home-section').style.display = 'block';
    document.getElementById('formulario-section').style.display = 'none';
    document.getElementById('resultados-section').style.display = 'none';
    personaActual = 'A';
    datosPersonaA = {};
    datosPersonaB = {};
    window.scrollTo(0, 0);
}

function mostrarPersonaA(valores = {}) {
    personaActual = 'A';
    document.getElementById('form-description').textContent = 'Indica qué tan de acuerdo estás con cada afirmación (0 = nada, 10 = totalmente)';
    document.getElementById('btn-atras').style.display = 'none';
    document.getElementById('btn-continuar').style.display = 'inline-flex';
    document.getElementById('btn-calcular').style.display = 'none';
    actualizarPaso(1);

    const container = document.getElementById('personas-container');
    container.innerHTML = generarFormularioPersona('A', 'Persona 1', valores);

    inicializarSliders();
    window.scrollTo(0, 0);
}

function continuarPersonaB() {
    datosPersonaA = leerPersona('a', new FormData(document.getElementById('compatibility-form')));
    mostrarPersonaB(datosPersonaB);
}

function volverAPersonaA() {
    datosPersonaB = leerPersona('b', new FormData(document.getElementById('compatibility-form')));
    mostrarPersonaA(datosPersonaA);
}

function mostrarPersonaB(valores = {}) {
    personaActual = 'B';
    document.getElementById('form-description').textContent = 'Indica qué tan de acuerdo estás con cada afirmación (0 = nada, 10 = totalmente)';
    document.getElementById('btn-atras').style.display = 'inline-flex';
    document.getElementById('btn-continuar').style.display = 'none';
    document.getElementById('btn-calcular').style.display = 'inline-flex';
    actualizarPaso(2);

    const container = document.getElementById('personas-container');
    container.innerHTML = generarFormularioPersona('B', 'Persona 2', valores);

    inicializarSliders();
    window.scrollTo(0, 0);
}

function generarFormularioPersona(letra, titulo, valores = {}) {
    const prefix = letra.toLowerCase();
    const v = (dim) => valores[dim] ?? 5;
    return `
        <div class="persona-card" style="grid-column: 1 / -1; max-width: 800px; margin: 0 auto;">
            <h3>${titulo}</h3>
            <div class="question-group">
                <label for="${prefix}_comunicacion">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Comunicación: Valoro la comunicación abierta y frecuente
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_comunicacion" name="${prefix}_comunicacion" min="0" max="10" value="${v('comunicacion')}" class="slider">
                    <span class="value-display">${v('comunicacion')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>

            <div class="question-group">
                <label for="${prefix}_valores">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Valores: Mis valores fundamentales son muy importantes para mí
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_valores" name="${prefix}_valores" min="0" max="10" value="${v('valores')}" class="slider">
                    <span class="value-display">${v('valores')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>

            <div class="question-group">
                <label for="${prefix}_conflicto">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4M12 16h.01"/>
                    </svg>
                    Conflictos: Prefiero resolver conflictos de inmediato
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_conflicto" name="${prefix}_conflicto" min="0" max="10" value="${v('conflicto')}" class="slider">
                    <span class="value-display">${v('conflicto')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>

            <div class="question-group">
                <label for="${prefix}_estilo_emocional">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
                    </svg>
                    Estilo Emocional: Expreso mis emociones abiertamente
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_estilo_emocional" name="${prefix}_estilo_emocional" min="0" max="10" value="${v('estilo_emocional')}" class="slider">
                    <span class="value-display">${v('estilo_emocional')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>

            <div class="question-group">
                <label for="${prefix}_tiempo_compartido">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    Tiempo Compartido: Me gusta pasar mucho tiempo con mi pareja
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_tiempo_compartido" name="${prefix}_tiempo_compartido" min="0" max="10" value="${v('tiempo_compartido')}" class="slider">
                    <span class="value-display">${v('tiempo_compartido')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>

            <div class="question-group">
                <label for="${prefix}_intimidad">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Intimidad: La cercanía física es muy importante para mí
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_intimidad" name="${prefix}_intimidad" min="0" max="10" value="${v('intimidad')}" class="slider">
                    <span class="value-display">${v('intimidad')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>

            <div class="question-group">
                <label for="${prefix}_metas_futuro">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Metas a Futuro: Tengo metas claras para mi futuro
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_metas_futuro" name="${prefix}_metas_futuro" min="0" max="10" value="${v('metas_futuro')}" class="slider">
                    <span class="value-display">${v('metas_futuro')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>

            <div class="question-group">
                <label for="${prefix}_apoyo_mutuo">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Apoyo Mutuo: Necesito apoyo constante de mi pareja
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_apoyo_mutuo" name="${prefix}_apoyo_mutuo" min="0" max="10" value="${v('apoyo_mutuo')}" class="slider">
                    <span class="value-display">${v('apoyo_mutuo')}</span>
                </div>
                <div class="scale-labels" aria-hidden="true"><span>0 = Nada</span><span>10 = Totalmente</span></div>
            </div>
        </div>
    `;
}

function inicializarSliders() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueDisplay = slider.nextElementSibling;
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
        });
    });
}

// Actualizar valores de sliders en tiempo real
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar animación de corazones
    createFloatingHearts();
    
    // Manejar envío del formulario
    const form = document.getElementById('compatibility-form');
    form.addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();
    
    
    // Recopilar datos de Persona B
    const formData = new FormData(e.target);
    const datosPersonaB = leerPersona('b', formData);
    
    // Combinar datos de ambas personas
    const data = {
        persona_a: datosPersonaA,
        persona_b: datosPersonaB
    };
    
    // Mostrar loading
    document.getElementById('formulario-section').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    
    try {
        // Enviar petición al backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        
        const resultado = await response.json();
        
        // Mostrar resultados
        mostrarResultados(resultado);
        
        
    } catch (error) {
        console.error('Error al calcular la compatibilidad:', error);
        alert('No se pudo calcular la compatibilidad. Revisa tu conexión e inténtalo de nuevo.');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('formulario-section').style.display = 'block';
    }
}

function mostrarResultados(resultado) {
    // Ocultar loading y formulario
    document.getElementById('loading').style.display = 'none';
    document.getElementById('formulario-section').style.display = 'none';
    
    // Mostrar sección de resultados
    const resultadosSection = document.getElementById('resultados-section');
    resultadosSection.style.display = 'block';
    window.scrollTo(0, 0);
    
    // Mostrar score principal
    const scorePrincipal = document.getElementById('score-principal');
    const clasificacion = resultado.analisis.clasificacion;
    const color = COLOR_NIVEL[clasificacion.nivel] || clasificacion.color;
    scorePrincipal.innerHTML = `
        <div class="score-value" style="color: ${color}">${resultado.compatibilidad_porcentaje}%</div>
        <div class="score-level" style="background: ${color}">${clasificacion.nivel}</div>
        <p class="score-desc">${clasificacion.descripcion}</p>
    `;
    
    // Crear gráfico radar
    crearGraficoRadar(resultado.visualizacion.radar);
    
    // Crear gráfico de barras
    crearGraficoBarras(resultado.visualizacion.barras);
    
    // Mostrar fortalezas
    const fortalezasContent = document.getElementById('fortalezas-content');
    fortalezasContent.innerHTML = resultado.analisis.fortalezas.length === 0
        ? '<div>Ninguna dimensión alcanza todavía el 70 % de compatibilidad.</div>'
        : resultado.analisis.fortalezas.map(f => `
        <div>
            <strong>${f.dimension}</strong>
            <span class="score-chip">${f.score.toFixed(1)}%</span>
        </div>
    `).join('');
    
    // Mostrar áreas de mejora
    const mejoraContent = document.getElementById('mejora-content');
    mejoraContent.innerHTML = resultado.analisis.areas_mejora.length === 0
        ? '<div>Ninguna dimensión está por debajo del 60 % de compatibilidad.</div>'
        : resultado.analisis.areas_mejora.map(a => `
        <div>
            <strong>${a.dimension}</strong>
            <span class="score-chip">${a.score.toFixed(1)}%</span>
        </div>
    `).join('');
    
    // Mostrar recomendaciones
    const recomendacionesContent = document.getElementById('recomendaciones-content');
    recomendacionesContent.innerHTML = resultado.analisis.recomendaciones.map(r => `
        <div class="recomendacion-item">${r}</div>
    `).join('');
}

function crearGraficoRadar(data) {
    if (radarChart) {
        radarChart.destroy();
    }

    const movil = esMovil();
    const ctx = document.getElementById('radarChart').getContext('2d');

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Persona 1',
                    data: data.persona_a,
                    borderColor: 'rgb(255, 20, 147)',
                    backgroundColor: 'rgba(255, 20, 147, 0.25)',
                    pointBackgroundColor: 'rgb(255, 20, 147)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 20, 147)',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 3
                },
                {
                    label: 'Persona 2',
                    data: data.persona_b,
                    borderColor: 'rgb(138, 43, 226)',
                    backgroundColor: 'rgba(138, 43, 226, 0.25)',
                    pointBackgroundColor: 'rgb(138, 43, 226)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(138, 43, 226)',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: movil ? 4 : 12 },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: '#718096',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: 'rgba(255, 107, 157, 0.15)'
                    },
                    pointLabels: {
                        color: '#2d3748',
                        // En pantallas angostas las etiquetas se parten en varias líneas
                        callback: (label) => (movil ? label.split(' ') : label),
                        font: {
                            size: movil ? 11 : 13,
                            weight: '600',
                            family: 'Poppins'
                        }
                    },
                    angleLines: {
                        color: 'rgba(255, 107, 157, 0.15)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#2d3748',
                        font: {
                            size: 14,
                            weight: '600',
                            family: 'Poppins'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

function crearGraficoBarras(data) {
    if (barChart) {
        barChart.destroy();
    }

    // Barras horizontales: las etiquetas largas se leen completas en cualquier ancho
    const ejeValor = 'x';
    const ejeCategoria = 'y';
    const ctx = document.getElementById('barChart').getContext('2d');

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Compatibilidad %',
                data: data.scores,
                backgroundColor: data.scores.map(colorPorPuntaje),
                borderWidth: 0,
                borderRadius: 10
            }]
        },
        options: {
            indexAxis: ejeCategoria,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                [ejeValor]: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#5a6578',
                        font: { family: 'Poppins' },
                        callback: (valor) => `${valor}%`
                    },
                    grid: {
                        color: 'rgba(255, 107, 157, 0.12)'
                    }
                },
                [ejeCategoria]: {
                    ticks: {
                        color: '#2d3748',
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        font: { family: 'Poppins', size: 12 }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.parsed[ejeValor].toFixed(1)}%`
                    }
                }
            }
        }
    });
}
