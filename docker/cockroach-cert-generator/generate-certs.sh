#!/bin/bash

set -e

# Verifica que las variables de entorno NODE_NAMES estén definidas
if [ -z "$NODE_NAMES" ]; then
  echo "NODE_NAMES variable not set. Exiting."
  exit 1
fi

# Define la ubicación del CA
CA_DIR=/certs/ca

# Verifica que no hay nada dentro de la carpeta del CA. En caso de que haya algo, acaba el script sin error.
if [ -d "$CA_DIR" ] && [ "$(ls -A $CA_DIR)" ]; then
  echo "Certificates already exist. Exiting."
  exit 0
fi

# Crea el CA
cockroach cert create-ca --certs-dir=$CA_DIR --ca-key=$CA_DIR/ca.key

# Genera certificados para cada nodo
IFS=',' read -ra NODES <<< "$NODE_NAMES"
for NODE in "${NODES[@]}"; do
  # Si NODE tiene un punto, coger lo que haya antes del punto
  NODE_DIR_NAME=$(echo $NODE | cut -d'.' -f1)
  NODE_DIR="/certs/nodes/${NODE_DIR_NAME}"
  mkdir -p "$NODE_DIR"
  # Genera el certificado del nodo
  cockroach cert create-node "$NODE" localhost 127.0.0.1 "$LOAD_BALANCER" --certs-dir=$CA_DIR --ca-key=$CA_DIR/ca.key

  # Mueve los archivos generados a la carpeta del nodo
  mv $CA_DIR/node.crt $CA_DIR/node.key "$NODE_DIR/"
  
  # Copia el ca.crt al directorio del nodo
  cp $CA_DIR/ca.crt "$NODE_DIR/"

  # Establece permisos para la clave del nodo
  chmod 700 "$NODE_DIR/node.key"
done

# Crea el certificado del cliente
cockroach cert create-client root --certs-dir=$CA_DIR --ca-key=$CA_DIR/ca.key

echo "Certificates created successfully."
