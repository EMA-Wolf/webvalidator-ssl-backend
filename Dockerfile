# # Use a base image with Java installed
# FROM owasp/zap2docker-stable

# # Set environment variables for OWASP ZAP
# ENV ZAP_PORT=8080
# ENV ZAP_API_KEY=

# # Expose the ZAP port
# EXPOSE $ZAP_PORT

# # Run OWASP ZAP in daemon mode with the specified port and API key disabled
# CMD ["zap.sh", "-daemon", "-port", "8080", "-config", "api.disablekey=true"]

FROM ghcr.io/puppeteer/puppeteer:22.13.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true \ 
    PUPPETEER_EXECUTABLE_PATH = /usr/bin/google-chrome-stable

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
CMD ["node", "secondServer.js"]