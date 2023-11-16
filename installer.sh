#!/bin/bash


clear

echo "\n
██████╗ ███████╗████████╗████████╗███████╗██████╗          
██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗         
██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝         
██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗         
██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║         
╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝         
                                                           
███████╗██████╗  ██████╗                  
██╔════╝██╔══██╗██╔════╝                  
█████╗  ██████╔╝██║                 
██╔══╝  ██╔══██╗██║                 
███████╗██║  ██║╚██████╗                  
╚══════╝╚═╝  ╚═╝ ╚═════╝                 
                                                           
██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗███████╗██████╗ 
██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
██║ █╗ ██║███████║   ██║   ██║     ███████║█████╗  ██████╔╝
██║███╗██║██╔══██║   ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║███████╗██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                           "
echo "installation wizard\n\n\n"

echo "Checking installation prerequisites for Single Node mode..."
echo "This can be altered to use Kubernetes if you know what you are doing."
echo "Basic installation on a single host will work just fine too and that is what this script does.  :D \n\n"


# Check if docker is installed
if command -v docker &> /dev/null; then
    echo "\t✓ Docker is already installed."
else
    read -p "Docker is not installed. Do you want to install it now? (y/n): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        # Update package information
        sudo apt-get update
        
        # Install prerequisites
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
        
        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
        
        # Set up the Docker stable repository
        sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
        
        # Update package information again
        sudo apt-get update
        
        # Install Docker
        sudo apt-get install -y docker-ce
        
        echo "\t✓ Docker has been installed!"
    else
        echo "Docker installation was skipped."
    fi
fi

read -p "Do you want to use MongoDB locally or from an external provider? (default is LOCAL and will check if already installed): " choice

# If the choice is empty (just Enter was pressed) or "local" is chosen
if [ -z "$choice" ] || [ "$choice" = "local" ]; then

    # Check if mongodb is installed
     if systemctl list-units --full -all | grep -Fq 'mongod.service'; then
        echo "\t✓ MongoDB is already installed."
    else
        read -p "MongoDB is not installed. Do you want to install it now? (y/n, default is y): " confirm
        # If confirm is empty (just Enter was pressed) or "y" is chosen
        if [[ -z $confirm || $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            # Import MongoDB public GPG key
            wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
            
            # Add MongoDB repository
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
            
            # Update package information
            sudo apt-get update
            
            # Install MongoDB
            sudo apt-get install -y mongodb-org
            
            # Start MongoDB
            sudo systemctl start mongod
            
            # Enable MongoDB to start on boot
            sudo systemctl enable mongod
            
            echo "\t✓ MongoDB has been installed and started!"
        else
            echo "MongoDB installation was skipped."
        fi
    fi
else
    echo "\t✓ You've chosen to use an external MongoDB provider. No local installation will be done."
fi



# GATHER ENVIRONMENT VARIABLE INFO TO BE COPIED INTO EACH MICRO-SERVICE .env FILE
#######################################

# Prompt for Infura API key
echo ""
read -p "What is your Infura API key? This can be changed later from the web UI: " INFURA_API_KEY

# Prompt for Etherscan API key
echo ""
read -p "What is your Etherscan API key? This can be changed later from the web UI: " ETHERSCAN_API_KEY


# Determine the bound IPs of the host
IP_ADDRESSES=$(hostname -I | tr ' ' '\n')

echo "\nBound IP Addresses:"
echo "$IP_ADDRESSES\n"

# Confirm the IP address for MongoDB
read -p "Please confirm the IP address for MongoDB from the above list, or specify a reachable Mongo host IP: " MONGO_IP

# Output to .env file
cat <<EOL > .env
INFURA_ENDPOINT_URL=https://mainnet.infura.io/v3/$INFURA_API_KEY
INFURA_WS_ENDPOINT_URL=wss://mainnet.infura.io/ws/v3/$INFURA_API_KEY
MONGODB_URI=mongodb://$MONGO_IP:27017
REDIS_URL=redis://$REDIS_IP:6379
MONGO_CONNECT_STRING=mongodb://$MONGO_IP:27017
ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY
# Static configurations
DB_NAME=watchedTokens
DB_NAME_FN=friendlyNames
COLLECTION_NAME=tokens
API_LISTEN_PORT=4000

COINGECKO_DB_NAME=coingecko_tokens
COINGECKO_TOKENS_COLLECTION_NAME=tokens

HTTPS=true
SSL_CRT_FILE=./certs/cert.pem
EOL

echo ".env file has been created/updated!"


# Define the path to the project folder and the global .env file
project_folder="."
global_env_file="./.env"

# Find all .env.example files in the project folder and its subdirectories
find "$project_folder" -type f -name ".env.example" | while read -r env_example_file; do
    # Define the path to the new .env file
    env_file="$(dirname "$env_example_file")/.env"
    
    # Check if a .env file already exists in the subdirectory, if not, copy the global .env file to the subdirectory
    if [[ ! -f "$env_file" ]]; then
        cp "$global_env_file" "$env_file"
    fi
done



echo "\n\t✓ creating self-signed certificate..." 
# Check if the 'certs' directory exists, if not, create it
if [ ! -d "./certs" ]; then
  mkdir ./certs
fi

# Generate a self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./certs/key.pem -out ./certs/cert.pem

echo "Self-signed certificate and key have been generated and placed in ./certs/"



echo "\t✓ building web-frontend docker image"
cd web-frontend
cp ../certs/* ./certs/
docker build -t better-erc20-watcher/react-app .

echo "\t✓ building api-gateway docker image"
cd ../micro-services/api-gateway
cp ../../certs/* ./certs/
cp ../../.env .
docker build -t better-erc20-watcher/api-gateway .

echo "\t✓ building compound-tx-summarizer docker image"
cd ../micro-services/compound-tx-summarizer
cp ../../certs/* ./certs/
cp ../../.env .
docker build -t better-erc20-watcher/compound-tx-summarizer .

echo "\t✓ building tagging-engine docker image"
cd ../micro-services/tagging-engine
cp ../../certs/* ./certs/
cp ../../.env .
docker build -t better-erc20-watcher/tagging-engine .

echo "\t✓ building tx-ingestion-engine docker image"
cd ../tx-ingestion-engine
cp ../../.env .
docker build -t better-erc20-watcher/tx-ingestion-engine .

echo "\t✓ building labeling-engine docker image"
cd ../labeling-engine
cp ../../.env .
docker build -t better-erc20-watcher/labeling-engine .

echo "\t✓ building txie-wrangler docker image"
cd ../txie-wrangler
cp ../../.env .
docker build -t better-erc20-watcher/txie-wrangler .

echo "\t✓ building master-rate-limiter docker image"
cd ../master-rate-limiter
cp ../../.env .
docker build -t better-erc20-watcher/master-rate-limiter .

echo "\t✓ building external-token-lookup-engine docker image"
cd ../external-token-lookup-engine
cp ../../.env .
docker build -t better-erc20-watcher/external-token-lookup-engine .


#optionally prune images at the end
#docker image prune -f


#before we start our micro-services, ensure mongo database is set up properly 
#.....

#copy all .env.example files into a .env file of the same location. Map values we defined in our written-out .env master file to each of the copied .env files
# Define the path to the project folder and the global .env file



#make sure MONGODB is bound on our external network so these docker images can communicate. Adjust as desired as it is probably not optimal. 

# Backup the original configuration file
sudo cp /etc/mongod.conf /etc/mongod.conf.bak

# Update the bindIp option to 0.0.0.0 to listen on all network interfaces
sudo sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf

# Restart the MongoDB service to apply the changes
sudo systemctl restart mongod

echo "Configuration updated and MongoDB restarted."



# attempt to start the docker-compose.yml group
cd ../../control-docker-compose/kafka
docker-compose up -d

cd ../project
docker-compose up -d


# Display the URL for the web frontend
echo "\n\n\nSetup complete. You can access the web frontend at: https://$MONGO_IP:3000"
