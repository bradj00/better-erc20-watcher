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

#!/bin/bash

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
    if command -v mongod &> /dev/null; then
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

# Prompt for ERC20 token address
echo "\nWhich ERC20 token contract do you want to begin watching?"
read -p "You can add more later from the web UI: " ERC20_CONTRACT_ADDRESS

# Prompt for Infura API key
echo ""
read -p "What is your Infura API key? This can be changed later from the web UI: " INFURA_API_KEY

# Determine the bound IPs of the host
IP_ADDRESSES=$(hostname -I | tr ' ' '\n')

echo "\nBound IP Addresses:"
echo "$IP_ADDRESSES\n"

# Confirm the IP address for MongoDB
read -p "Please confirm the IP address for MongoDB from the above list, or specify a reachable Mongo host IP: " MONGO_IP

# Confirm the IP address for Redis
read -p "Please confirm the IP address for Redis from the above list, or specify a reachable Redis host IP: " REDIS_IP

# Output to .env file
cat <<EOL > .env
ERC20_CONTRACT_ADDRESS=$ERC20_CONTRACT_ADDRESS
INFURA_ENDPOINT_URL=https://mainnet.infura.io/v3/$INFURA_API_KEY
INFURA_WS_ENDPOINT_URL=wss://mainnet.infura.io/ws/v3/$INFURA_API_KEY
MONGODB_URI=mongodb://$MONGO_IP:27017
REDIS_URL=redis://$REDIS_IP:6379

# Static configurations
DB_NAME=watchedTokens
DB_NAME_FN=friendlyNames
COLLECTION_NAME=tokens
API_LISTEN_PORT=4000
HTTPS=true
SSL_CRT_FILE=./certs/cert.pem
EOL

echo ".env file has been created/updated!"

# cp ./.env

#check to make sure docker is installed. if not, install it.

#generate a self-signed cert and place it in the root project directory ./certs/

# Check if the 'certs' directory exists, if not, create it
if [ ! -d "./certs" ]; then
  mkdir ./certs
fi

# Generate a self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./certs/key.pem -out ./certs/cert.pem

echo "Self-signed certificate and key have been generated and placed in ./certs/"



echo "\t✓ building docker images...\n\n"


cd web-frontend
cp ../certs/* ./certs/
docker build -t better-erc20-watcher/react-app:latest .

cd ../micro-services/api-gateway
cp ../../certs/* ./certs/
cp ../../.env .
docker build -t better-erc20-watcher/api-gateway:latest .

cd ../tx-ingestion-engine
cp ../../.env .
docker build -t better-erc20-watcher/tx-ingestion-engine:latest .

cd ../labeling-engine
cp ../../.env .
docker build -t better-erc20-watcher/labeling-engine:latest .

cd ../master-rate-limiter
cp ../../.env .
docker build -t better-erc20-watcher/master-rate-limiter:latest .

cd ../token-external-lookup
cp ../../.env .
docker build -t better-erc20-watcher/token-external-lookup:latest .


#optionally prune images at the end
#docker image prune -f

#delete root project .env file now that we have copied it everywhere it needs to go.
# rm ./.env

# if no errors, signal SUCCESS! 



#before we start our micro-services, ensure mongo database is set up properly 
#.....


# attempt to start the docker-compose.yml group
cd ../../
docker-compose up -d