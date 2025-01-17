# Use Node 18 alpine for a small, efficient base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /usr/src/app

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy package files first (for better caching)
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend .

# The port your app will run on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]