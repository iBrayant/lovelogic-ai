"""
Módulo de Lógica Difusa para Compatibilidad Emocional

Implementa:
- Funciones de membresía triangulares y trapezoidales
- Reglas difusas para evaluar similitud
- Agregación de dimensiones
"""
import logging
from typing import Dict

log = logging.getLogger(__name__)


class FuzzyCompatibility:
    """
    Sistema de lógica difusa para evaluar compatibilidad emocional
    """

    def membership_muy_similar(self, diferencia: float) -> float:
        """
        Función de membresía triangular para 'muy similar'
        Máximo en diferencia=0, decae linealmente hasta diferencia=2
        """
        if diferencia <= 0:
            return 1.0
        elif diferencia <= 2:
            return 1.0 - (diferencia / 2.0)
        else:
            return 0.0

    def membership_similar(self, diferencia: float) -> float:
        """
        Función de membresía trapezoidal para 'similar'
        Activa entre diferencia 1.5 y 4.5
        """
        if diferencia <= 1.5:
            return 0.0
        elif diferencia <= 2.5:
            return (diferencia - 1.5) / 1.0
        elif diferencia <= 3.5:
            return 1.0
        elif diferencia <= 4.5:
            return 1.0 - (diferencia - 3.5) / 1.0
        else:
            return 0.0

    def membership_diferente(self, diferencia: float) -> float:
        """
        Función de membresía triangular para 'diferente'
        Crece linealmente de diferencia=3 a 6 y decae de 6 a 8, donde
        pasa a ser 'muy diferente' por completo.
        """
        if diferencia <= 3:
            return 0.0
        elif diferencia <= 6:
            return (diferencia - 3) / 3.0
        elif diferencia <= 8:
            return 1.0 - (diferencia - 6) / 2.0
        else:
            return 0.0

    def membership_muy_diferente(self, diferencia: float) -> float:
        """
        Función de membresía para 'muy diferente'
        Crece de diferencia=5 a 7 y se mantiene en 1 desde ahí
        """
        if diferencia <= 5:
            return 0.0
        elif diferencia <= 7:
            return (diferencia - 5) / 2.0
        else:
            return 1.0

    def fuzzify_difference(self, diferencia: float) -> Dict[str, float]:
        """
        Fuzzifica una diferencia en grados de membresía
        """
        return {
            "muy_similar": self.membership_muy_similar(diferencia),
            "similar": self.membership_similar(diferencia),
            "diferente": self.membership_diferente(diferencia),
            "muy_diferente": self.membership_muy_diferente(diferencia)
        }

    def apply_fuzzy_rules(self, memberships: Dict[str, float]) -> float:
        """
        Aplica reglas difusas para obtener score de compatibilidad

        Reglas:
        - SI muy_similar ENTONCES compatibilidad = 100%
        - SI similar ENTONCES compatibilidad = 75%
        - SI diferente ENTONCES compatibilidad = 40%
        - SI muy_diferente ENTONCES compatibilidad = 10%
        """
        outputs = {
            "muy_similar": 100,
            "similar": 75,
            "diferente": 40,
            "muy_diferente": 10
        }

        # Defuzzificación usando promedio ponderado (método del centroide simplificado)
        numerador = sum(memberships[key] * outputs[key] for key in memberships)
        denominador = sum(memberships.values())

        if denominador == 0:
            log.debug("Sin activación de reglas, se usa el valor neutral 50.0")
            return 50.0

        resultado = numerador / denominador
        log.debug("Defuzzificación: %.2f / %.3f = %.2f", numerador, denominador, resultado)
        return resultado

    def calculate_dimension_compatibility(self, persona_a: Dict, persona_b: Dict) -> Dict[str, float]:
        """
        Calcula compatibilidad difusa para cada dimensión
        """
        resultados = {}

        for dim in persona_a:
            diferencia = abs(persona_a[dim] - persona_b[dim])
            memberships = self.fuzzify_difference(diferencia)
            compatibilidad = self.apply_fuzzy_rules(memberships)
            log.debug("%s: diferencia=%.2f -> %.2f%%", dim, diferencia, compatibilidad)
            resultados[dim] = round(compatibilidad, 2)

        return resultados

    def calculate_global_compatibility(self, dimension_scores: Dict[str, float]) -> float:
        """
        Calcula compatibilidad global con pesos por dimensión

        Valores y comunicación pesan más (1.5); el resto entre 1.0 y 1.3.
        """
        pesos = {
            "comunicacion": 1.5,
            "valores": 1.5,
            "conflicto": 1.2,
            "estilo_emocional": 1.0,
            "tiempo_compartido": 1.0,
            "intimidad": 1.2,
            "metas_futuro": 1.3,
            "apoyo_mutuo": 1.2
        }

        suma_ponderada = 0.0
        suma_pesos = 0.0

        for dim, score in dimension_scores.items():
            peso = pesos.get(dim, 1.0)
            suma_ponderada += score * peso
            suma_pesos += peso

        resultado = suma_ponderada / suma_pesos
        log.debug("Score global difuso: %.2f / %.2f = %.2f", suma_ponderada, suma_pesos, resultado)
        return resultado
