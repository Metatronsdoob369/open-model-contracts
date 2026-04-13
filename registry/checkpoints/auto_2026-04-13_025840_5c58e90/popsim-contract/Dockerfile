# Use official Node.js image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for tsc)
RUN npm install && npm install -g typescript

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the port
EXPOSE 8080

# Start the server
# Cloud Run provides the PORT environment variable
CMD ["node", "dist/bridge-server.js"]
