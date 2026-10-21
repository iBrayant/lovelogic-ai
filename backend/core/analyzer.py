"""
Módulo de Análisis y Visualización

Genera reportes textuales y datos para gráficos
"""
from typing import Dict, List

# Umbrales para el reporte: una dimensión es fortaleza desde 70 % y
# área de mejora por debajo de 60 % (el mismo corte de las recomendaciones).
UMBRAL_FORTALEZA = 70
UMBRAL_MEJORA = 60

class CompatibilityAnalyzer:
    """
    Analizador que genera insights y prepara datos para visualización
    """
    
    def __init__(self):
        self.dimension_names = {
            "comunicacion": "Comunicación",
            "valores": "Valores Compartidos",
            "conflicto": "Manejo de Conflictos",
            "estilo_emocional": "Estilo Emocional",
            "tiempo_compartido": "Tiempo Compartido",
            "intimidad": "Intimidad",
            "metas_futuro": "Metas a Futuro",
            "apoyo_mutuo": "Apoyo Mutuo"
        }
    
    def classify_compatibility(self, score: float) -> Dict[str, str]:
        """
        Clasifica el nivel de compatibilidad
        """
        if score >= 85:
            return {
                "nivel": "Excelente",
                "descripcion": "Compatibilidad muy alta. Las respuestas muestran gran alineación emocional.",
                "color": "#4CAF50"
            }
        elif score >= 70:
            return {
                "nivel": "Buena",
                "descripcion": "Compatibilidad sólida. Hay buena sintonía con algunas diferencias manejables.",
                "color": "#8BC34A"
            }
        elif score >= 55:
            return {
                "nivel": "Moderada",
                "descripcion": "Compatibilidad media. Existen diferencias que requieren comunicación activa.",
                "color": "#FFC107"
            }
        elif score >= 40:
            return {
                "nivel": "Baja",
                "descripcion": "Compatibilidad limitada. Diferencias significativas en áreas importantes.",
                "color": "#FF9800"
            }
        else:
            return {
                "nivel": "Muy Baja",
                "descripcion": "Compatibilidad baja. Perspectivas muy diferentes en múltiples dimensiones.",
                "color": "#F44336"
            }
    
    def identify_strengths_weaknesses(self, dimension_scores: Dict[str, float]) -> Dict:
        """
        Identifica fortalezas (hasta 3 dimensiones con score >= 70) y
        áreas de mejora (hasta 3 dimensiones con score < 60).
        Si ninguna dimensión cumple el criterio, la lista queda vacía.
        """
        ordenadas = sorted(dimension_scores.items(), key=lambda par: par[1], reverse=True)

        def formatear(par):
            return {"dimension": self.dimension_names[par[0]], "score": par[1]}

        fortalezas = [formatear(p) for p in ordenadas if p[1] >= UMBRAL_FORTALEZA][:3]
        debilidades = [formatear(p) for p in reversed(ordenadas) if p[1] < UMBRAL_MEJORA][:3]

        return {
            "fortalezas": fortalezas,
            "areas_mejora": debilidades
        }

    def generate_recommendations(self, dimension_scores: Dict[str, float]) -> List[str]:
        """
        Genera recomendaciones basadas en las dimensiones más débiles
        """
        recommendations = []
        
        # Analizar cada dimensión
        if dimension_scores.get("comunicacion", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Comunicación: Practiquen la escucha activa y expresen sus necesidades claramente."
            )
        
        if dimension_scores.get("valores", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Valores: Dialoguen sobre sus principios fundamentales y busquen puntos en común."
            )
        
        if dimension_scores.get("conflicto", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Conflictos: Establezcan reglas para discusiones constructivas y eviten ataques personales."
            )
        
        if dimension_scores.get("estilo_emocional", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Estilo Emocional: Respeten sus diferencias en expresión emocional y busquen balance."
            )
        
        if dimension_scores.get("tiempo_compartido", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Tiempo: Negocien expectativas sobre tiempo juntos vs. tiempo personal."
            )
        
        if dimension_scores.get("intimidad", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Intimidad: Conversen abiertamente sobre necesidades de cercanía física y emocional."
            )
        
        if dimension_scores.get("metas_futuro", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Metas: Alineen sus visiones de futuro y encuentren objetivos compartidos."
            )
        
        if dimension_scores.get("apoyo_mutuo", 100) < UMBRAL_MEJORA:
            recommendations.append(
                "Apoyo: Fortalezcan la red de soporte mutuo en momentos difíciles."
            )
        
        if not recommendations:
            recommendations.append(
                "Ninguna dimensión muestra una compatibilidad baja. Sigan cultivando la comunicación y el apoyo mutuo."
            )
        
        return recommendations
    
    def generate_analysis(self, persona_a: Dict, persona_b: Dict, 
                         dimension_scores: Dict[str, float], 
                         final_score: float) -> Dict:
        """
        Genera análisis completo de compatibilidad
        """
        classification = self.classify_compatibility(final_score)
        strengths_weaknesses = self.identify_strengths_weaknesses(dimension_scores)
        recommendations = self.generate_recommendations(dimension_scores)
        
        return {
            "clasificacion": classification,
            "fortalezas": strengths_weaknesses["fortalezas"],
            "areas_mejora": strengths_weaknesses["areas_mejora"],
            "recomendaciones": recommendations
        }
    
    def prepare_chart_data(self, persona_a: Dict, persona_b: Dict, 
                          dimension_scores: Dict[str, float]) -> Dict:
        """
        Prepara datos para visualización en frontend
        """
        # Datos para gráfico radar
        labels = [self.dimension_names[dim] for dim in persona_a.keys()]
        
        radar_data = {
            "labels": labels,
            "persona_a": list(persona_a.values()),
            "persona_b": list(persona_b.values())
        }
        
        # Datos para gráfico de barras (compatibilidad por dimensión)
        bar_data = {
            "labels": labels,
            "scores": [dimension_scores[dim] for dim in persona_a.keys()]
        }
        
        return {
            "radar": radar_data,
            "barras": bar_data
        }
