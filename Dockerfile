# Use an official Node runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Puppeteer with Chromium
RUN npm install puppeteer

# Set environment variable for Puppeteer to use the bundled Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/src/app/node_modules/puppeteer/.local-chromium/linux-*/chrome-linux/chrome

# Add Puppeteer required dependencies
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' && \
    apt-get update && apt-get install -y google-chrome-stable && \
    apt-get install -y fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libcups2 libgbm1 libgtk-3-0 libnspr4 libnss3 libxss1 xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "secondServer.js"]
