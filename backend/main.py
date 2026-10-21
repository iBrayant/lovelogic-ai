"""
Plataforma de Compatibilidad Emocional - Backend Principal
FastAPI server que procesa las respuestas y calcula compatibilidad
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core.fuzzy import FuzzyCompatibility
from core.probabilistic import BayesianAdjuster
from core.analyzer import CompatibilityAnalyzer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
log = logging.getLogger("lovelogic")

app = FastAPI(title="Emotional Compatibility API")

# En producción el frontend y la API comparten dominio (Vercel), así que CORS
# solo se habilita para el desarrollo local.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def puntaje() -> float:
    return Field(ge=0, le=10)


class PersonResponses(BaseModel):
    """Modelo de respuestas de una persona (8 dimensiones, escala 0-10)"""
    comunicacion: float = puntaje()
    valores: float = puntaje()
    conflicto: float = puntaje()
    estilo_emocional: float = puntaje()
    tiempo_compartido: float = puntaje()
    intimidad: float = puntaje()
    metas_futuro: float = puntaje()
    apoyo_mutuo: float = puntaje()


class CompatibilityRequest(BaseModel):
    """Modelo de petición con respuestas de ambas personas"""
    persona_a: PersonResponses
    persona_b: PersonResponses


@app.get("/")
def root():
    return {"message": "API de Compatibilidad Emocional activa"}


@app.post("/api/compatibilidad")
def calcular_compatibilidad(request: CompatibilityRequest):
    """
    Endpoint principal que calcula la compatibilidad emocional

    Proceso:
    1. Convierte respuestas a diccionarios
    2. Aplica lógica difusa para evaluar similitud
    3. Ajusta con modelo probabilístico Bayesiano
    4. Genera análisis y datos de visualización
    """
    persona_a = request.persona_a.model_dump()
    persona_b = request.persona_b.model_dump()

    fuzzy = FuzzyCompatibility()
    bayesian = BayesianAdjuster()
    analyzer = CompatibilityAnalyzer()

    fuzzy_scores = fuzzy.calculate_dimension_compatibility(persona_a, persona_b)
    fuzzy_global = fuzzy.calculate_global_compatibility(fuzzy_scores)
    final_score = bayesian.adjust_score(fuzzy_global, fuzzy_scores)
    analysis = analyzer.generate_analysis(persona_a, persona_b, fuzzy_scores, final_score)
    chart_data = analyzer.prepare_chart_data(persona_a, persona_b, fuzzy_scores)

    # No se registran las respuestas de las personas, solo el resultado.
    log.info("Compatibilidad calculada: %.1f%% (%s)", final_score, analysis["clasificacion"]["nivel"])

    return {
        "compatibilidad_porcentaje": round(final_score, 1),
        "compatibilidad_fuzzy": round(fuzzy_global, 1),
        "dimensiones": fuzzy_scores,
        "analisis": analysis,
        "visualizacion": chart_data
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
