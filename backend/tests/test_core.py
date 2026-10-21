import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.analyzer import CompatibilityAnalyzer  # noqa: E402
from core.fuzzy import FuzzyCompatibility  # noqa: E402
from core.probabilistic import BayesianAdjuster  # noqa: E402
from main import app  # noqa: E402

DIMENSIONES = [
    "comunicacion", "valores", "conflicto", "estilo_emocional",
    "tiempo_compartido", "intimidad", "metas_futuro", "apoyo_mutuo",
]


def persona(valor):
    return {d: valor for d in DIMENSIONES}


def test_respuestas_identicas_dan_100():
    fuzzy = FuzzyCompatibility()
    assert fuzzy.apply_fuzzy_rules(fuzzy.fuzzify_difference(0)) == 100


def test_diferencia_maxima_da_10():
    fuzzy = FuzzyCompatibility()
    assert fuzzy.apply_fuzzy_rules(fuzzy.fuzzify_difference(10)) == pytest.approx(10)


def test_compatibilidad_baja_de_forma_monotona_con_la_diferencia():
    fuzzy = FuzzyCompatibility()
    puntajes = [fuzzy.apply_fuzzy_rules(fuzzy.fuzzify_difference(d / 2)) for d in range(0, 21)]
    assert all(a >= b for a, b in zip(puntajes, puntajes[1:]))


def test_ajuste_bayesiano_queda_en_rango():
    bayes = BayesianAdjuster()
    for valor in (0, 50, 100):
        scores = {d: valor for d in DIMENSIONES}
        assert 0 <= bayes.adjust_score(valor, scores) <= 100


def test_sin_dimensiones_debiles_no_hay_areas_de_mejora():
    analisis = CompatibilityAnalyzer().generate_analysis(
        persona(8), persona(8), {d: 100.0 for d in DIMENSIONES}, 95
    )
    assert analisis["areas_mejora"] == []
    assert len(analisis["fortalezas"]) == 3


def test_sin_dimensiones_fuertes_no_hay_fortalezas():
    analisis = CompatibilityAnalyzer().generate_analysis(
        persona(0), persona(10), {d: 20.0 for d in DIMENSIONES}, 20
    )
    assert analisis["fortalezas"] == []
    assert len(analisis["areas_mejora"]) == 3


def test_endpoint_devuelve_resultado_completo():
    cliente = TestClient(app)
    r = cliente.post("/api/compatibilidad", json={"persona_a": persona(8), "persona_b": persona(7)})
    assert r.status_code == 200
    cuerpo = r.json()
    assert 0 <= cuerpo["compatibilidad_porcentaje"] <= 100
    assert set(cuerpo["dimensiones"]) == set(DIMENSIONES)


@pytest.mark.parametrize("valor", [-1, 11, 1000])
def test_endpoint_rechaza_valores_fuera_de_0_a_10(valor):
    cliente = TestClient(app)
    r = cliente.post("/api/compatibilidad", json={"persona_a": persona(valor), "persona_b": persona(5)})
    assert r.status_code == 422
