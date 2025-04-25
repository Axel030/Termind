import os
import openai
import psycopg2
import re
from dotenv import load_dotenv
from openai import OpenAI
#       Lo que se necesita para utilizar la IA chatgpt
#-Descargar la bilblioteca oficioa de chatgpt
# comando a utilizar : pip install openai

# Cargar variables de entorno
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Conectar a PostgreSQL
def connect_db():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        return conn
    except Exception as e:
        print("❌ Error conectando a la base de datos:", e)
        return None

def query_db(query):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(query)
            result = cur.fetchall()
            cur.close()
            conn.close()
            return result
        except Exception as e:
            return f"Error en la consulta: {e}"
    return "No se pudo conectar a la base de datos."

# Función actualizada para generar SQL con la nueva API
def generar_sql(pregunta):
    contexto = """
Genera EXCLUSIVAMENTE una consulta PostgreSQL válida basada en la pregunta.
- Tabla: "Alumnos" (columnas: ID_Alumnos, Nombre, Apellido, Telefono)
- Solo el código SQL, sin explicaciones ni comentarios
- Usar comillas dobles para identificadores (ej: SELECT * FROM "Alumnos"), hazlo tambien con las variables de la tabla con el Nombre, Apellido, Telefono, etc.
- No incluyas texto fuera de la consulta, solo se quiere exclusivamente la consulta.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": contexto},
                {"role": "user", "content": pregunta}
            ],
            temperature=0,
            max_tokens=100
        )

        content = response.choices[0].message.content.strip()
        sql_query = re.search(r"^SELECT.*?(?:;|$)", content, re.DOTALL | re.IGNORECASE)
        consulta_final = sql_query.group(0).strip() if sql_query else "Error: No se pudo generar la consulta"

        total_tokens = response.usage.total_tokens
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens

        return consulta_final, total_tokens, prompt_tokens, completion_tokens

    except Exception as e:
        return f"❌ Error generando consulta con ChatGPT: {e}", 0, 0, 0

def calcular_costo(prompt_tokens, completion_tokens, modelo="gpt-3.5-turbo"):
    # Precios por 1K tokens en USD
    precios = {
        "gpt-3.5-turbo": {
            "prompt": 0.0005,
            "completion": 0.0015
        },
        "gpt-4": {
            "prompt": 0.03,
            "completion": 0.06
        }
    }

    if modelo not in precios:
        return "Modelo no soportado para cálculo de costo."

    prompt_costo = (prompt_tokens / 1000) * precios[modelo]["prompt"]
    completion_costo = (completion_tokens / 1000) * precios[modelo]["completion"]
    total = prompt_costo + completion_costo

    return round(total, 6)  # redondeado a 6 decimales

def main():
    print("🛠️ Bienvenido al asistente de BD. Escribe tu pregunta:")
    user_input = input("> ")

    consulta_sql, total_tokens, prompt_tokens, completion_tokens = generar_sql(user_input)
    print(f"🔍 Consulta generada: {consulta_sql}")
    print(f"📊 Tokens usados - Total: {total_tokens}, Prompt: {prompt_tokens}, Respuesta: {completion_tokens}")

    costo = calcular_costo(prompt_tokens, completion_tokens, modelo="gpt-3.5-turbo")
    print(f"💲 Costo estimado: ${costo} USD")

    respuesta = query_db(consulta_sql)
    print(f"🤖 Respuesta de la BD: {respuesta}")


if __name__ == "__main__":
    main()