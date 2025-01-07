# How to run using Docker

1. Build the image
- `sudo docker build . -t drone_connect_backend`
2. Execute the image. Remember to publish the port while running. Exposing the port is not enough. We need to create the connection between host and docker container by publishing the port
- `sudo docker run -it -p 4000:4000 --rm --name drone_connect_backend`
