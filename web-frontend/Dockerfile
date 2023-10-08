# Use an official node runtime as the parent image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the entire project
COPY . ./

# Build the app
RUN npm run build

# Use a lightweight node image to serve the build app
FROM nginx:1.17-alpine

# Set the working directory in nginx to its default directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static build directory from builder stage
COPY --from=0 /app/build .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
