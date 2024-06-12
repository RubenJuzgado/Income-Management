#!/bin/bash
# Script que recibe como parámetro un nodo y e inicializa el cluster de cockroachdb de forma segura con el certificado ca en la ruta /certs/ca.

set -e

# Verifica que la variable de entorno NODE_NAME esté definida
if [ -z "$NODE_NAME" ]; then
  echo "NODE_NAME variable not set. Exiting."
  exit 1
fi

# Define la ubicación del CA
CA_DIR=/certs/ca

# Verifica que dentro de la carpeta del CA se encuentre un fichero ca.crt y ca.key
if [ ! -f "$CA_DIR/ca.crt" ] || [ ! -f "$CA_DIR/ca.key" ]; then
  echo "CA files not found. Exiting."
  exit 1
fi

# En caso de que la variable de entorno CLUSTER_NAME se inicia sin la bandera --cluster-name. En caso de que esté definida, se añade la bandera.
if [ -z "$CLUSTER_NAME" ]; then
  cockroach init --certs-dir=$CA_DIR --host=$NODE_NAME
else
  cockroach init --certs-dir=$CA_DIR --host=$NODE_NAME --cluster-name=$CLUSTER_NAME
fi

# Crear usuario y base de datos
cockroach sql --certs-dir=$CA_DIR --host=$NODE_NAME -e "CREATE USER IF NOT EXISTS $USER WITH PASSWORD '$PASSWORD';"
cockroach sql --certs-dir=$CA_DIR --host=$NODE_NAME -e "CREATE DATABASE IF NOT EXISTS \"$DATABASE\";"
cockroach sql --certs-dir=$CA_DIR --host=$NODE_NAME -e "GRANT ALL ON DATABASE \"$DATABASE\" TO $USER;"
cockroach sql --certs-dir=$CA_DIR --host=$NODE_NAME -e "GRANT admin TO $USER;"


echo "Cluster initialized successfully."
