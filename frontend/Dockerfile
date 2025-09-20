FROM node:20-slim
FROM node:18-slim

WORKDIR /app

# Configure npm for better network performance
ENV NPM_CONFIG_CACHE=/tmp/npm-cache \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_RETRY_ATTEMPTS=5

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
