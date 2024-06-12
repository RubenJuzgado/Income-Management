# Create file .env in the route backend/project The script will receive the values from environment and it will be executed after building up a docker-compose.yml file. The script will be executed by the command python create-env.py.
# The script will receive the following variables: DATABASE_NAME DATABASE_USER DATABASE_PASSWORD DATABASE_HOST DATABASE_PORT CERT_PATH
# The script will generate a SECRET_KEY for the Django project and a ENCRYPTION_KEY using fernet.

import os
import subprocess
import random
import string
from cryptography.fernet import Fernet

def generate_key():
    key = ''.join(random.choices(string.ascii_letters + string.digits, k=50))
    return key

def generate_fernet_key():
    key = Fernet.generate_key()
    return key.decode()

def create_env_file():
    with open('backend/project/.env', 'w') as f:
        f.write(f"SECRET_KEY={generate_key()}\n")
        f.write(f"ENCRYPTION_KEY={generate_fernet_key()}\n")
        # The following variables will be received from the environment
        f.write(f"DATABASE_NAME={os.environ['DATABASE_NAME']}\n")
        f.write(f"DATABASE_USER={os.environ['DATABASE_USER']}\n")
        f.write(f"DATABASE_PASSWORD={os.environ['DATABASE_PASSWORD']}\n")
        f.write(f"DATABASE_HOST={os.environ['DATABASE_HOST']}\n")
        f.write(f"DATABASE_PORT={os.environ['DATABASE_PORT']}\n")
        f.write(f"CERT_PATH={os.environ['CERT_PATH']}\n")

if __name__ == '__main__':
    create_env_file()
    # Lanzar desde la consola de comandos "python manage.py makemigrations" y "python manage.py migrate" para crear las tablas en la base de datos
    subprocess.run(["python", "backend/project/manage.py", "makemigrations", "api"])
    subprocess.run(["python", "backend/project/manage.py", "migrate"])
    print("Base de datos creada")
    # Lanzar desde la consola de comandos "python manage.py runserver" para iniciar el servidor
    print("Iniciando servidor")
    subprocess.run(["python", "backend/project/manage.py", "runserver", "0.0.0.0:8000"])
