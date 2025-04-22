import psycopg2
import getpass
import sys

class PostgreSQLManager:
    def __init__(self):
        # Configuracion de la conexion a la base de datos
        self.connection_params = {
            "user": "postgres",     # usuario default si no cambiar
            "password": "1234",     # siempre poner su password
            "host": "localhost",    # host igualmente default 
            "port": "5432",         # port es igual default si no cambiar
            "database": "scolegio"  # si la db tiene otro nombre cambiar
        }
        self.connection = None
        
        try:
            self.connection = psycopg2.connect(**self.connection_params)
            print("Conexion a la base de datos exitosa")
        except Exception as e:
            print(f"Error en la conexion a la base de datos: {e}")
            sys.exit(1)
    
    def query_alumno(self):
        """Consulta todos los registros de la tabla"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("SELECT * FROM usuarios")
            rows = cursor.fetchall()
            cursor.close()
            return rows
        except Exception as e:
            print(f"Error en la consulta: {e}")
            return None
    
    def validate_login(self, username, password):
        """Valida las credenciales de inicio de sesion"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("SELECT usuario, contraseña FROM Usuarios WHERE usuario = %s", (username,))
            user_data = cursor.fetchall()
            cursor.close()
            
            if not user_data:
                return False, "Lo siento, su usuario no existe"
            
            stored_password = user_data[0][1]
            if password == stored_password:
                return True, "Inicio de sesion exitoso"
            else:
                return False, "Error en el inicio de sesion"
                
        except Exception as e:
            print(f"Error en la validacion: {e}")
            return False, f"Error: {str(e)}"
    
    def close_connection(self):
        """Cierra la conexion a la base de datos"""
        if self.connection:
            self.connection.close()
            print("Conexion a la base de datos cerrada")


def display_menu():
    """Muestra el menu principal"""
    print("\n===== SISTEMA =====")
    print("1. Iniciar sesion")
    print("2. Consultar alumnos")
    print("3. Salir")
    return input("Seleccione una opcion: ")


def main():
    # Inicializar el administrador de base de datos
    db_manager = PostgreSQLManager()
    
    while True:
        option = display_menu()
        
        if option == "1":
            # Opcion de inicio de sesion
            username = input("Usuario: ")
            password = getpass.getpass("Contraseña: ")  # getpass oculta la contraseña al escribir
            
            # Validar que se proporcionaron credenciales
            if not username or not password:
                print("Error: Faltan credenciales")
                continue
            
            # Validar el login
            success, message = db_manager.validate_login(username, password)
            print(message)
            
        elif option == "2":
            # Opcion de consulta de alumnos
            alumnos = db_manager.query_alumno()
            if alumnos:
                print("\n===== LISTA=====")
                for alumno in alumnos:
                    print(alumno)
            else:
                print("No se pudieron obtener los datos")
            
        elif option == "3":
            # Opcion de salida
            db_manager.close_connection()
            print("¡Hasta pronto!")
            break
            
        else:
            print("Opcion no valida. Intente de nuevo.")


if __name__ == "__main__":
    main()