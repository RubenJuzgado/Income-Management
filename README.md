<h1>Income-Management</h1>

<h2>Code requirements</h2>
<ul>
 <li>Install requirements.txt python packages</li>
 <li>Install package.json dependencies located in \backend\project\frontend</li>
</ul>
<h2>CockroachDB Setup Insecure</h2>
This setup will be for testing.
<ol>
 <li>Install cockroach on different hosts (at least 3). From now on they will be called nodes:</li>
  <ul>
    <li>For Windows: https://www.cockroachlabs.com/docs/v23.2/install-cockroachdb-windows</li>
    <li>For Linux: https://www.cockroachlabs.com/docs/v23.2/install-cockroachdb-linux</li>
  </ul>
 <li>Now we can start the nodes. Open a shell and run the following command on each node: <code>cockroach start --insecure --listen-addr=node_IP:26257 --http-addr=node_IP:8080 --join=node1_IP:26257,node2_IP:26257,node3_IP:26257,...</code></li>
  <b>Note:</b>  "node_IP" is the IP of the node where you are writing the command.
 <li>Once all the nodes are ready, run the next command to start the cluster: <code>cockroach init --insecure --host=any_node_IP:26257</code></li>
</ol>
Now you would have the cluster running
<h3>Load Balancer Setup</h3>
Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing. We are going to use HAProxy. To install it, follow the next steps:
<ol>
  <li>Install HAProxy: <code>apt-get install haproxy</code></li>
  <li>Download the CockroachDB Archive for linux and extract the binary: <code>curl https://binaries.cockroachdb.com/cockroach-v23.2.5.linux-amd64.tgz | tar -xz</code></li>
  <li>Copy the binary into the PATH: <code>cp -i cockroach-v23.2.5.linux-amd64/cockroach /usr/local/bin/</code></li>
</ol>
Now, to configure the HAProxy follow the next steps:
<ol>
  <li>Run the cockroach gen haproxy command, specifying the address of any CockroachDB node: <code>cockroach gen haproxy --insecure --host=any_node_ip --port=26257</code></li>
  <li>Start HAProxy, with the -f flag pointing to the haproxy.cfg file: <code>haproxy -f haproxy.cfg</code></li>
</ol>
