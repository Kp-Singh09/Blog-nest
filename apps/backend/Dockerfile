# Use an official, stable Node.js version as the base
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json file first to leverage Docker's caching
COPY package.json .

# Install the application dependencies
RUN npm install

# Copy the rest of your backend code into the container
COPY . .

# Tell Docker that the container will listen on port 3000
EXPOSE 3000

# The command to run your application when the container starts
CMD [ "node", "--env-file=.env", "index.js" ]