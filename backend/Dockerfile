# Use Node 18 alpine for a small, efficient base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# The port your app will run on
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "dev"]