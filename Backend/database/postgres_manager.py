import psycopg2
from config.settings import POSTGRES_URL

class PostgreSQLManager:
    def __init__(self):
        self.conn = psycopg2.connect(POSTGRES_URL)
        self.cursor = self.conn.cursor()
    
    def buscar_alumnos(self, filtro: str, valor: str):
        try:
            query = f"SELECT * FROM alumnos WHERE {filtro} = %s"
            self.cursor.execute(query, (valor,))
            return self.cursor.fetchall()
        except Exception as e:
            print(f"Error en pgAdmin4/PostgreSQL: {e}")
            return []
    
    def close(self):
        self.cursor.close()
        self.conn.close()