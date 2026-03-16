# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install esbuild globally
RUN npm install -g esbuild

# Copy prisma schema first
COPY prisma/schema.prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Create a startup script that runs migrations then starts the app
RUN echo '#!/bin/sh\necho "Running database migrations..."\nnpx prisma migrate deploy\necho "Starting application..."\nnpm run start:prod' > /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

# Define the command to run the startup script
CMD ["./start.sh"]