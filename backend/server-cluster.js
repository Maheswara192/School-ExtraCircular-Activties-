const cluster = require('cluster');
const os = require('os');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config();

/**
 * Cluster Manager
 * Spawns a worker process for each CPU core.
 * This ensures the application can handle High Traffic by utilizing all available hardware.
 */

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master Process ${process.pid} is running`);
    console.log(`Forking server for ${numCPUs} CPUs...\n`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Resilience: Restart worker if it dies
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });

} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    require('./server.js');
    console.log(`Worker Process ${process.pid} started`);
}
