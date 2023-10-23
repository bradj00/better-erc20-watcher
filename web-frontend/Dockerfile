# Use an official node runtime as the parent image
FROM node:20.3.1

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the entire project
COPY . ./

# Set HTTPS environment variable
ENV HTTPS=true

# The command to run the app in development mode
CMD ["npm", "start"]
