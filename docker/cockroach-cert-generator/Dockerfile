# Use cockroachdb image
FROM cockroachdb/cockroach:latest

# Create directories for certificates
RUN mkdir -p /certs/ca /certs/nodes

# Add the script to generate certificates
COPY generate-certs.sh /usr/local/bin/generate-certs.sh
RUN chmod +x /usr/local/bin/generate-certs.sh

# Set the working directory
WORKDIR /certs

# Entry point
ENTRYPOINT ["/usr/local/bin/generate-certs.sh"]
