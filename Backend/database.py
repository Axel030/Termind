import psycopg2
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

def conectar_bd():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )

def obtener_nombre_bd():
    try:
        conn = conectar_bd()
        cursor = conn.cursor()
        cursor.execute("SELECT current_database();")
        nombre_bd = cursor.fetchone()[0]
        conn.close()
        return f"El nombre de la base de datos es: {nombre_bd}"
    except Exception as e:
        return f"Error al obtener el nombre de la BD: {str(e)}"