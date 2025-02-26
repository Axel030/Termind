from database.postgres_manager import PostgreSQLManager
from models.deepseek_model import DeepSeekModel

def main():
    db = PostgreSQLManager()
    ia = DeepSeekModel()
    
    while True:
        print("\n--- Sistema de Gestión Escolar (pgAdmin4) ---")
        print("1. Buscar alumnos por filtro")
        print("2. Consultar IA educativa")
        print("3. Salir")
        
        opcion = input("Seleccione: ")
        
        if opcion == "1":
            print("\nFiltros disponibles: nombre, apellido, grado")
            filtro = input("Filtro: ").lower()
            valor = input("Valor: ")
            
            alumnos = db.buscar_alumnos(filtro, valor)
            if alumnos:
                print("\nResultados:")
                for alumno in alumnos:
                    print(f"ID: {alumno[0]} | {alumno[1]} {alumno[2]} | Grado: {alumno[4]}")
            else:
                print("No se encontraron registros.")
                
        elif opcion == "2":
            pregunta = input("\nEscriba su pregunta educativa: ")
            respuesta = ia.consulta_educativa(pregunta)
            print("\nRespuesta IA:\n" + respuesta)
            
        elif opcion == "3":
            db.close()
            print("Sesión finalizada.")
            break

if __name__ == "__main__":
    main()