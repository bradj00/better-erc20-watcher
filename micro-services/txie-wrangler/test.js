const { exec } = require('child_process');

// Function to list all Docker containers
function stopContainerWithMatchingEnvVar(desiredEnvVar, desiredValue) {
    exec(`docker ps -q`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }

        const containerIDs = stdout.trim().split('\n');
        containerIDs.forEach(id => {
            inspectAndStopContainer(id, desiredEnvVar, desiredValue);
        });
    });
}

// Function to inspect a Docker container and stop it if it has the desired environment variable set to the desired value
function inspectAndStopContainer(containerID, desiredEnvVar, desiredValue) {
    exec(`docker inspect ${containerID}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`inspect error: ${error}`);
            return;
        }

        const containerInfo = JSON.parse(stdout);
        const envVars = containerInfo[0].Config.Env;
        
        for (let env of envVars) {
            const [key, value] = env.split('=');
            if (key === desiredEnvVar && value === desiredValue) {
                console.log(`Found matching container with ID: ${containerID}`);
                stopContainer(containerID);
                break;
            }
        }
    });
}

// Function to stop a Docker container
function stopContainer(containerID) {
    console.log(`Attempting to stop container with ID: ${containerID}`);
    exec(`docker stop ${containerID}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`stop error: ${error}`);
            return;
        }
        console.log(`Successfully stopped container with ID: ${containerID}`);
    });
}

// Example usage
const desiredEnvVar = 'ERC20_CONTRACT_ADDRESS';
const desiredValue = '0x1892f6ff5fbe11c31158f8c6f6f6e33106c5b10e';
stopContainerWithMatchingEnvVar(desiredEnvVar, desiredValue);
