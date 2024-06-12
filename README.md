<h1>Income-Management</h1>

<h2>Code requirements</h2>
<ul>
 <li>Install requirements.txt python packages</li>
 <li>Install package.json dependencies located at \backend\project\frontend</li>
</ul>
<h2>Synchronize clocks on different Linux machines</h2>
Coming soon
<h2>CockroachDB Setup Insecure</h2>
This setup will be for testing.
<ol>
 <li>Install cockroach on different hosts (at least 3). From now on they will be called nodes:</li>
  <ul>
    <li>For Windows: https://www.cockroachlabs.com/docs/v23.2/install-cockroachdb-windows</li>
    <li>For Linux: https://www.cockroachlabs.com/docs/v23.2/install-cockroachdb-linux</li>
  </ul>
 <li>Now we can start the nodes. Open a shell and run the following command on each node: <code>cockroach start --insecure --listen-addr=node_IP:26257 --http-addr=node_IP:8080 --join=node1_IP:26257,node2_IP:26257,node3_IP:26257,...</code></li>
  <b>Note:</b>  "node_IP" is the IP of the node where you are writing the command. All nodes must have their clocks synchronized.
 <li>Once all the nodes are ready, run the next command to start the cluster: <code>cockroach init --insecure --host=any_node_IP:26257</code></li>
</ol>
Now you would have the cluster running
<h3>Load Balancer Setup</h3>
Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing. We are going to use HAProxy. To install it, follow the next steps:
<ol>
  <li>Install HAProxy: <code>apt-get install haproxy</code></li>
  <li>Download the CockroachDB Archive for Linux and extract the binary: <code>curl https://binaries.cockroachdb.com/cockroach-v23.2.5.linux-amd64.tgz | tar -xz</code></li>
  <li>Copy the binary into the PATH: <code>cp -i cockroach-v23.2.5.linux-amd64/cockroach /usr/local/bin/</code></li>
</ol>
Now, to configure the HAProxy follow the next steps:
<ol>
  <li>Run the cockroach gen haproxy command, specifying the address of any CockroachDB node: <code>cockroach gen haproxy --insecure --host=any_node_ip --port=26257</code></li>
  <li>Start HAProxy, with the -f flag pointing to the haproxy.cfg file: <code>haproxy -f haproxy.cfg</code></li>
</ol>
<h2>CockroachDB Setup Secure</h2>
This setup would work for a production environment
 <h3>Installation</h3>
 Install CockroachDB on different hosts that will be the nodes (at least 3) and the local machine:
  <ul>
    <li>For Windows: https://www.cockroachlabs.com/docs/v23.2/install-cockroachdb-windows</li>
    <li>For Linux: https://www.cockroachlabs.com/docs/v23.2/install-cockroachdb-linux</li>
  </ul>
 <h3>Generate certificates</h3>
 Cockroach cert commands or openssl commands can be used to generate security certificates. We will use cockroach cert commands. Follow the next steps:
 <ol>
  <li>Create two directories in your local machine: <code>mkdir certs my-safe-directory</code></li>
  <b>Note: </b>Certs will be the folder where you will store the generated CA certificate and all node and client certificates and keys. my-safe-directory is where you will store your CA key and then reference the key when generating node and client certificates.
  <li>Create the CA (Certificate Authority) certificate and key pair: <code>cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key</code></li>
  <li>Create the certificate and key pair for your nodes. You need to include all the common names, hostnames and IPs used to refer the node you are creating the certificate for, as well as for the load balancer: 
   <code>cockroach cert create-node --overwrite node_internal_IP_address node_external_IP_address node_hostname other_common_names_for_node localhost 127.0.0.1 load_balancer_IP_address load_balancer_hostname other_common_names_for_load_balancer --certs-dir=certs --ca-key=my-safe-directory/ca.key</code></li>
  <li>Upload the CA and node certificates and key to the node. You can use ssh and scp to do it: <code>ssh username@node_address "mkdir certs"</code> <code>scp certs/ca.crt certs/node.crt certs/node.key username@node_address</code> </li>
  <b>Note:</b> Do these last 2 steps for every node.
  <br>
 </ol>
 These next 2 steps are for creating a client certificate so you can log in as root from a machine.
 <ol>
  <li>Create a client certificate and key for the root user: <code>cockroach cert create-client root --certs-dir=certs --ca-key=my-safe-directory/ca.key</code></li>
  <li>Upload the CA certificate and client certificate and key to the machine you want to log in as root: <code>ssh username@machine_address "mkdir certs"</code> <code>scp certs/ca.crt certs/client.root.crt certs/client.root.key username@machine_address:~/certs</code></li>
 </ol>
 <h3>Start nodes</h3>
 Ensure you have cockroachdb installed in each node and the binary copied to the path. Then, follow the next steps on each node:
 <ol>
  <li>CockroachDB uses custom-built versions of the GEOS libraries. Copy these libraries to the location where CockroachDB expects to find them: <code>sudo mkdir -p /usr/local/lib/cockroach</code> <code>sudo cp -i cockroach-v24.1.0.linux-amd64/lib/libgeos.so /usr/local/lib/cockroach/</code> <code>sudo cp -i cockroach-v24.1.0.linux-amd64/lib/libgeos_c.so /usr/local/lib/cockroach/</code></li>
  <li>Run the cockroach start command: <code>cockroach start --certs-dir=certs --advertise-addr=node_address --join=node1_address,node2_address,node3_address</code></li>
 </ol>
 Then initialize the cluster from the local machine using the command: <code>cockroach init --certs-dir=certs --host=address_of_any_node_on_join_list</code>
 <h3>Set up load balancing</h3>
This time you will generate the haproxy file from the local machine. Follow the next steps:
<ol>
 <li>Run the cockroach gen haproxy command: <code>cockroach gen haproxy --certs-dir=certs --host=address_of_any_node</code></li>
 <li>Upload the haproxy.cfg file to the machine where you want to run HAProxy: <code>scp haproxy.cfg username@load_balancer_address:~/ </code></li>
</ol>
Now, from the load balancer machine, follow the next steps:
<ol>
 <li>Install HAProxy in the load balancer machine: <code>sudo apt-get install haproxy</code></li>
 <li>Start HAProxy: <code>haproxy -f haproxy.cfg</code></li>
</ol>
<h2>Docker Setup Secure</h2>
For this setup you only need docker and npm installed.
<h3>Configuration</h3>
<ol>
 <li>Install package.json dependencies located at \backend\project\frontend</li>
 <li>Create the following docker images:</li>
 <ul>
  <li>income-management-app: the Dockerfile is located at the root of the project. Move to this folder and execute the command: <code>docker build -t income-management-app .</code></li>
  <li>cockroach-cert-generator: the Dockerfile is located at /docker/cockroach-cert-generator. Move to this folder and execute the command: <code>docker build -t cockroach-cert-generator .</code></li>
  <li>cockroach-init: the Dockerfile is located at /docker/cockroach-init. Move to this folder and execute the command: <code>docker build -t cockroach-init .</code></li>
 </ul>
 <li>Move to /docker and start the containers with the command: <code>docker compose up -d</code></li>
</ol>
<h3>Explanation of the images</h3>
<h4>Income-management-app</h4>
It's built from a python3.12 image. It installs all the dependencies in requirements.txt, copies all the files (except the ones in .dockerignore) and exposes port 8000. When the container is started, it executes the script create-env.py. This script creates a .env file with the variables needed (some of them are specified at docker-compose.yml), makes the migrations and starts the server.

<h4>Cockroach-cert-generator</h4>
Its function is to create all the certificates needed for each node.

<h4>Cockroach-init</h4>
Its function is to init the cluster, create the user with a password, create the database and give the user all the permissions on the database.
