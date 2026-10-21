# LoveLogic AI

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deploy-000000?logo=vercel&logoColor=white)

Plataforma que analiza la **compatibilidad emocional entre dos personas**. Cada una responde 8 dimensiones en una escala de 0 a 10, y el sistema combina **lógica difusa** y un **ajuste bayesiano** para entregar un porcentaje de compatibilidad, gráficos comparativos, fortalezas, áreas de mejora y recomendaciones.

> Obra con registro ante la DNDA (2025), desarrollada en coautoría.

<!-- TODO: captura o GIF de la app (guardar en docs/img/) -->
<!-- ![Demo](docs/img/demo.png) -->
<!-- TODO: enlace a la demo desplegada en Vercel -->

## Características

- **8 dimensiones:** comunicación, valores, conflicto, estilo emocional, tiempo compartido, intimidad, metas a futuro y apoyo mutuo.
- **Lógica difusa:** para cada dimensión se mide la diferencia entre las dos respuestas y se clasifica con funciones de membresía (muy similar, similar, diferente, muy diferente). Reglas difusas la convierten en un puntaje por dimensión y otro global.
- **Ajuste bayesiano:** el puntaje global se refina según la consistencia entre dimensiones.
- **Clasificación del resultado:** excelente (≥ 85), buena (≥ 70), moderada (≥ 55), baja (≥ 40) y muy baja.
- **Visualización:** gráfico de radar que superpone ambos perfiles y gráfico de barras con la compatibilidad por dimensión (Chart.js).
- **Reporte textual** con fortalezas, áreas de mejora y recomendaciones generadas por reglas.

## Cómo funciona

```
Cuestionario (Persona A y B) → POST /api/compatibilidad
        │
        ├─ 1. FuzzyCompatibility    -> puntaje difuso por dimensión y global
        ├─ 2. BayesianAdjuster      -> ajuste por consistencia entre dimensiones
        ├─ 3. CompatibilityAnalyzer -> clasificación, fortalezas, mejoras y recomendaciones
        └─ 4. JSON -> radar + barras + reporte
```

## Stack

Python · FastAPI · Pydantic · NumPy · pandas · HTML/CSS/JavaScript · Chart.js

## Estructura

```
backend/
├── main.py                  -> API FastAPI (POST /api/compatibilidad)
├── core/fuzzy.py            -> lógica difusa
├── core/probabilistic.py    -> ajuste bayesiano
├── core/analyzer.py         -> análisis y datos para los gráficos
└── test_example.py          -> ejemplo de cálculo paso a paso
frontend/                    -> interfaz (index.html, app.js, styles.css)
api/index.py                 -> punto de entrada para Vercel
registration_docs/           -> documentación del registro de la obra
```

## Cómo correrlo

**1. Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

La documentación interactiva de la API queda en http://localhost:8000/docs.

**2. Frontend**

En otra terminal:

```bash
cd frontend
python -m http.server 5500
```

Abre http://localhost:5500. En local, el frontend llama a `http://127.0.0.1:8000`; desplegado en Vercel usa la ruta `/api/compatibilidad`.

**Ejemplo de cálculo sin interfaz:** `cd backend && python test_example.py`.

## API

`POST /api/compatibilidad` con las 8 dimensiones (0–10) de cada persona:

```json
{
  "persona_a": {
    "comunicacion": 8, "valores": 9, "conflicto": 7, "estilo_emocional": 6,
    "tiempo_compartido": 8, "intimidad": 7, "metas_futuro": 9, "apoyo_mutuo": 8
  },
  "persona_b": { "...": "mismas 8 dimensiones" }
}
```

Responde con `compatibilidad_porcentaje`, `compatibilidad_fuzzy` (antes del ajuste), `dimensiones`, `analisis` y `visualizacion`.

## Aviso

LoveLogic es una herramienta de carácter educativo y demostrativo. Sus resultados salen de un modelo matemático sobre respuestas autoinformadas y **no sustituyen la orientación de un profesional** en relaciones o salud mental.

## Autores

<!-- TODO: completar con los nombres de los coautores -->
**Brayant Vásquez Gómez** y colaboradores · [GitHub](https://github.com/iBrayant) · [LinkedIn](https://linkedin.com/in/brayant-vásquez-gómez)
