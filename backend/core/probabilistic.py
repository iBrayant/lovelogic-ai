"""
Módulo de Ajuste Probabilístico Bayesiano

Implementa un modelo Bayesiano simple que ajusta el score difuso
basándose en la varianza de las dimensiones
"""
import logging
import math
import statistics
from typing import Dict

log = logging.getLogger(__name__)


class BayesianAdjuster:
    """
    Ajustador Bayesiano que refina el score de compatibilidad

    Concepto:
    - Prior: score difuso inicial
    - Likelihood: basado en consistencia entre dimensiones
    - Posterior: score ajustado final
    """

    def __init__(self):
        # Prior: distribución inicial (neutral)
        self.prior_mean = 50.0
        self.prior_std = 20.0

    def calculate_consistency(self, dimension_scores: Dict[str, float]) -> float:
        """
        Calcula consistencia entre dimensiones

        Alta consistencia (baja varianza) = relación más predecible
        Baja consistencia (alta varianza) = relación más compleja
        """
        std_dev = statistics.pstdev(dimension_scores.values())

        # Normalizar: varianza baja = consistencia alta
        # std_dev puede ir de 0 a ~40
        return max(0, 100 - (std_dev * 2.5))

    def calculate_likelihood(self, fuzzy_score: float, consistency: float) -> float:
        """
        Calcula la desviación estándar del likelihood a partir de la consistencia

        Consistencia alta (>70) -> std pequeña (confianza alta)
        Consistencia baja (<30) -> std grande (más incertidumbre)
        """
        likelihood_std = 30 - (consistency * 0.25)
        return max(5, likelihood_std)  # Mínimo 5

    def bayesian_update(self, prior_mean: float, prior_std: float,
                        observation: float, obs_std: float) -> tuple:
        """
        Actualización Bayesiana clásica para distribuciones gaussianas

        Fórmula:
        posterior_mean = (prior_std² * obs + obs_std² * prior) / (prior_std² + obs_std²)
        posterior_std = sqrt((prior_std² * obs_std²) / (prior_std² + obs_std²))
        """
        prior_var = prior_std ** 2
        obs_var = obs_std ** 2

        posterior_mean = (prior_var * observation + obs_var * prior_mean) / (prior_var + obs_var)
        posterior_var = (prior_var * obs_var) / (prior_var + obs_var)

        return posterior_mean, math.sqrt(posterior_var)

    def adjust_score(self, fuzzy_score: float, dimension_scores: Dict[str, float]) -> float:
        """
        Ajusta el score difuso usando inferencia Bayesiana

        Proceso:
        1. Calcular consistencia entre dimensiones
        2. Determinar likelihood basado en consistencia
        3. Aplicar actualización Bayesiana
        4. Retornar score ajustado
        """
        consistency = self.calculate_consistency(dimension_scores)
        obs_std = self.calculate_likelihood(fuzzy_score, consistency)

        posterior_mean, posterior_std = self.bayesian_update(
            self.prior_mean,
            self.prior_std,
            fuzzy_score,
            obs_std
        )

        # Pequeño ajuste adicional por consistencia (±5 puntos como máximo)
        consistency_bonus = (consistency - 50) * 0.1
        final_score = max(0, min(100, posterior_mean + consistency_bonus))

        log.debug(
            "Bayes: consistencia=%.2f obs_std=%.2f posterior=%.2f±%.2f bonus=%+.2f final=%.2f",
            consistency, obs_std, posterior_mean, posterior_std, consistency_bonus, final_score,
        )
        return final_score
