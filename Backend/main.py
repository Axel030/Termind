import os
import ollama 
import psycopg2
import re  
from dotenv import load_dotenv
#Pasos para utilizar la Ia en Ollama
# 1. Descargar ollama
# 2. Despues de tenerlo instalado colocar esto en la consola : ollama pull deepseek-r1:7b
# 3. Una vez descargado, puedes probarlo con: ollama run deepseek-r1:7b
# 4. Hay que descargarlo en python tambien, se utiliza este comando en la consola: pip install ollama
# 5. Se tiene que instalar tambien dotenv, este es para cargar variables de entorno desde un archivo .env.
#    esto se hace con "pip install dotenv".a

# Cargar variables de entorno
load_dotenv()

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

# Función para hacer consultas en la DB
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

# 🆕 **Mejora en la generación de SQL**
def generar_sql(pregunta):
    contexto = """
    Genera SOLO una consulta SQL en texto plano basada en la pregunta del usuario.
    - La base de datos se llama 'ColegioDB' y tiene una tabla llamada 'Alumnos'.
    - La tabla 'Alumnos' tiene las columnas: ID_Alumnos, Nombre, Apellido, Telefono.
    - Tu respuesta debe contener ÚNICAMENTE la consulta SQL válida, sin explicaciones ni texto adicional.
    - Usa comillas dobles en el nombre de la tabla, por ejemplo: SELECT * FROM "Alumnos".
    - No incluyas texto en inglés, comentarios, ni formato Markdown como ```sql ... ```.
    """

    response = ollama.chat(model="deepseek-r1:7b", messages=[
        {"role": "system", "content": contexto},
        {"role": "user", "content": f"Genera una consulta SQL para: {pregunta}"}
    ])

    sql_response = response["message"]["content"].strip()

    # 🛑 **Eliminar cualquier texto adicional**
    match = re.search(r"(SELECT .* FROM .*?)(?:;|\n|$)", sql_response, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()  # Extrae solo la consulta SQL

    return sql_response  # En caso de que la IA devuelva la consulta sin caracteres extra

# Función principal
def main():
    print("🛠️ Bienvenido al asistente de BD. Escribe tu pregunta:")
    user_input = input("> ")

    # Generar la consulta con la IA
    consulta_sql = generar_sql(user_input)

    print(f"🔍 Consulta generada: {consulta_sql}")

    # Ejecutar la consulta en PostgreSQL
    respuesta = query_db(consulta_sql)
    respuesta2= query_db('SELECT * FROM "Alumnos"')

    print(f"🤖 Respuesta de la IA: {respuesta}")
    print(f"🤖 Respuesta Solida: {respuesta2}")

if __name__ == "__main__":
    main()
