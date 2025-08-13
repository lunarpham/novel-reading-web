FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Run the application
RUN npm run dev

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "dev"]