# set the base image to create the image for react app
FROM node:20-alpine

# create a user with permissions to run the app
# -S -> create a system user
# -G -> add the user to a group
# This is done to avoid running the app as root
# If the app is run as root, any vulnerability in the app can be exploited to gain access to the host system
# It's a good practice to run the app as a non-root user
# RUN addgroup app && adduser -S -G app app
# USER app

# set the working directory to /app
WORKDIR /app

# copy package.json and package-lock.json to the working directory
# This is done before copying the rest of the files to take advantage of Docker’s cache
# If the package.json and package-lock.json files haven’t changed, Docker will use the cached dependencies
COPY package*.json *.js /tests ./

# sometimes the ownership of the files in the working directory is changed to root
# and thus the app can't access the files and throws an error -> EACCES: permission denied
# to avoid this, change the ownership of the files to the root user
# USER root
# RUN chown -R app:app .
# USER app


# copy the rest of the files to the working directory
# install dependencies
RUN npm install

COPY . .
# expose port 5173 to tell Docker that the container listens on the specified network ports at runtime
EXPOSE 4000

# command to run the app
CMD npm run dev
