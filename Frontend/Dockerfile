FROM node:20-bullseye-slim

# Create app directory
WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy rest of the source
COPY . .

# Ensure Next listens on all interfaces
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
