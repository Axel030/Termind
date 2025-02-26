from deepseek import DeepSeek
from config.settings import DEEPSEEK_API_KEY

class DeepSeekModel:
    def __init__(self):
        self.client = DeepSeek(api_key=DEEPSEEK_API_KEY)
    
    def consulta_educativa(self, pregunta: str):
        prompt = f"Como asistente de un colegio, responde de manera pedagógica: {pregunta}"
        response = self.client.generate(
            prompt=prompt,
            model="deepseek-chat",
            temperature=0.5
        )
        return response.choices[0].text.strip()