# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source code inside the Docker image
COPY . .

# Install additional dependencies for html-pdf
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libxext-dev \
    libxrender-dev \
    libfontconfig1

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the app
CMD ["node", "secondServer.js"]
