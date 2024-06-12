# Use cockroachdb image
FROM cockroachdb/cockroach:latest

# Add the script to init the cluster
COPY init-cluster.sh /usr/local/bin/init-cluster.sh

RUN chmod +x /usr/local/bin/init-cluster.sh

# Entry point
ENTRYPOINT ["/usr/local/bin/init-cluster.sh"]