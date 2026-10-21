// Configuración de la API
// En local (archivo o servidor estático con puerto) el backend corre en el puerto 8000;
// desplegado, el API comparte dominio con el frontend.
const API_URL = (window.location.protocol === 'file:' || window.location.port)
    ? `http://${window.location.hostname || '127.0.0.1'}:8000/api/compatibilidad`
    : '/api/compatibilidad';

// Variables globales para los gráficos
let radarChart = null;
let barChart = null;

// Crear corazones flotantes
function createFloatingHearts() {
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

// Funciones de navegación
function mostrarFormulario() {
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('formulario-section').style.display = 'block';
    personaActual = 'A';
    datosPersonaA = {};
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
    window.scrollTo(0, 0);
}

function mostrarPersonaA() {
    personaActual = 'A';
    document.getElementById('form-description').textContent = 'Persona 1: Responde usando la escala de 0 a 10';
    document.getElementById('btn-continuar').style.display = 'inline-flex';
    document.getElementById('btn-calcular').style.display = 'none';
    
    const container = document.getElementById('personas-container');
    container.innerHTML = generarFormularioPersona('A', 'Persona 1');
    
    // Reinicializar sliders
    inicializarSliders();
}

function continuarPersonaB() {
    // Guardar datos de Persona A
    const form = document.getElementById('compatibility-form');
    const formData = new FormData(form);
    
    datosPersonaA = {
        comunicacion: parseFloat(formData.get('a_comunicacion')),
        valores: parseFloat(formData.get('a_valores')),
        conflicto: parseFloat(formData.get('a_conflicto')),
        estilo_emocional: parseFloat(formData.get('a_estilo_emocional')),
        tiempo_compartido: parseFloat(formData.get('a_tiempo_compartido')),
        intimidad: parseFloat(formData.get('a_intimidad')),
        metas_futuro: parseFloat(formData.get('a_metas_futuro')),
        apoyo_mutuo: parseFloat(formData.get('a_apoyo_mutuo'))
    };
    
    
    // Mostrar formulario de Persona B
    mostrarPersonaB();
}

function mostrarPersonaB() {
    personaActual = 'B';
    document.getElementById('form-description').textContent = 'Persona 2: Responde usando la escala de 0 a 10';
    document.getElementById('btn-continuar').style.display = 'none';
    document.getElementById('btn-calcular').style.display = 'inline-flex';
    
    const container = document.getElementById('personas-container');
    container.innerHTML = generarFormularioPersona('B', 'Persona 2');
    
    // Reinicializar sliders
    inicializarSliders();
    window.scrollTo(0, 0);
}

function generarFormularioPersona(letra, titulo) {
    const prefix = letra.toLowerCase();
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
                    <input type="range" id="${prefix}_comunicacion" name="${prefix}_comunicacion" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
            </div>

            <div class="question-group">
                <label for="${prefix}_valores">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Valores: Mis valores fundamentales son muy importantes para mí
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_valores" name="${prefix}_valores" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
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
                    <input type="range" id="${prefix}_conflicto" name="${prefix}_conflicto" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
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
                    <input type="range" id="${prefix}_estilo_emocional" name="${prefix}_estilo_emocional" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
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
                    <input type="range" id="${prefix}_tiempo_compartido" name="${prefix}_tiempo_compartido" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
            </div>

            <div class="question-group">
                <label for="${prefix}_intimidad">
                    <svg class="question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Intimidad: La cercanía física es muy importante para mí
                </label>
                <div class="slider-container">
                    <input type="range" id="${prefix}_intimidad" name="${prefix}_intimidad" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
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
                    <input type="range" id="${prefix}_metas_futuro" name="${prefix}_metas_futuro" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
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
                    <input type="range" id="${prefix}_apoyo_mutuo" name="${prefix}_apoyo_mutuo" min="0" max="10" value="5" class="slider">
                    <span class="value-display">5</span>
                </div>
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
    const datosPersonaB = {
        comunicacion: parseFloat(formData.get('b_comunicacion')),
        valores: parseFloat(formData.get('b_valores')),
        conflicto: parseFloat(formData.get('b_conflicto')),
        estilo_emocional: parseFloat(formData.get('b_estilo_emocional')),
        tiempo_compartido: parseFloat(formData.get('b_tiempo_compartido')),
        intimidad: parseFloat(formData.get('b_intimidad')),
        metas_futuro: parseFloat(formData.get('b_metas_futuro')),
        apoyo_mutuo: parseFloat(formData.get('b_apoyo_mutuo'))
    };
    
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
    scorePrincipal.innerHTML = `
        <div style="color: ${clasificacion.color}">
            ${resultado.compatibilidad_porcentaje}%
        </div>
        <div style="font-size: 0.5em; margin-top: 10px;">
            ${clasificacion.nivel} - ${clasificacion.descripcion}
        </div>
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
            <span style="float: right; color: #ff6b9d; font-weight: 600;">${f.score.toFixed(1)}%</span>
        </div>
    `).join('');
    
    // Mostrar áreas de mejora
    const mejoraContent = document.getElementById('mejora-content');
    mejoraContent.innerHTML = resultado.analisis.areas_mejora.length === 0
        ? '<div>Ninguna dimensión está por debajo del 60 % de compatibilidad.</div>'
        : resultado.analisis.areas_mejora.map(a => `
        <div>
            <strong>${a.dimension}</strong>
            <span style="float: right; color: #ff6b9d; font-weight: 600;">${a.score.toFixed(1)}%</span>
        </div>
    `).join('');
    
    // Mostrar recomendaciones
    const recomendacionesContent = document.getElementById('recomendaciones-content');
    recomendacionesContent.innerHTML = resultado.analisis.recomendaciones.map(r => `
        <div class="recomendacion-item">${r}</div>
    `).join('');
}

function crearGraficoRadar(data) {
    // Destruir gráfico anterior si existe
    if (radarChart) {
        radarChart.destroy();
    }
    
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
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: '#b8b8d1',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: 'rgba(255, 107, 157, 0.1)'
                    },
                    pointLabels: {
                        color: '#2d3748',
                        font: {
                            size: 13,
                            weight: '600',
                            family: 'Poppins'
                        }
                    },
                    angleLines: {
                        color: 'rgba(255, 107, 157, 0.1)'
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
            },
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function crearGraficoBarras(data) {
    // Destruir gráfico anterior si existe
    if (barChart) {
        barChart.destroy();
    }
    
    const ctx = document.getElementById('barChart').getContext('2d');
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Compatibilidad %',
                data: data.scores,
                backgroundColor: 'rgba(255, 107, 157, 0.6)',
                borderColor: 'rgb(255, 107, 157)',
                borderWidth: 0,
                borderRadius: 12,
                hoverBackgroundColor: 'rgba(255, 193, 227, 0.8)',
                hoverBorderColor: 'rgb(255, 193, 227)'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#b8b8d1',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 107, 157, 0.08)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#ffc1e3',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
