# Image search and favourite API

This RESTful api enables users to search for images and videos, then save them as favourites.

Content is sourced from the [Pixabay API](https://pixabay.com/api/docs/), and your own api key must be set up in the environment variables in order to fetch content.

## Installation

The project is set up to be run using [Docker](https://www.docker.com/).

### Docker compose

The easiest way to run the project is using docker compose. First set up your Pixabay API key in the `.env` file.

```bash
# Enter the api key from your pixabay account here
PIXABAY_API_KEY=<pixabay api key>
```

Build the web server image

```bash
docker compose build
```

Run the services

```bash
docker compose up
```

Now that the project is running, the documentation outlining the endpoints and resourses of this RESTful api is hosted at http://localhost:80.

### Development with hot reload

When developing it's convenient to have source code changes applied without having to rebuild the image. As [nodemon](https://nodemon.io/) is included as a dev dependency and used in the web server Dockerfile, one possible way to achieve this is by running containers individually with the source code mounted as a volume.

First create a docker network for the containers to use, so that they can communicate with each other by container name

```bash
docker network create <network name>
```

Build the image for the api server

```bash
docker build -t <server image>:1.0 .
```

Run the postgres database container

```bash
docker run -d \
  --name <db container name> \
  --network <network name> \
  -e POSTGRES_DB=<database name> \
  -e POSTGRES_PASSWORD=<password> \
  -e POSTGRES_USER=<username> \
  postgres:16-alpine
```

Run the web server container (from project root directory)

```bash
docker run \
  --name express_api \
  --network <network name> \
  -e PG_PASSWORD=<password> \
  -e PG_DB=<database name> \
  -e PG_USER=<username> \
  -e PG_HOST=<db container name> \
  -e PIXABAY_API_KEY=<pixabay api key> \
  -p 3000:3000 \
  -v "$(pwd):/app" \
  -v /app/node_modules \
  <server image>:1.0
```

Now the web server should be listening at `localhost:3000`

## Release Notes

### v1.0

### New features

- User Authentication system using [Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication).
- Search endpoint for authenticated users to search for images or video and recieve a paginated response.
- Favourites endpoint for authenticated users to fetch all their saved content with a paginated response, add new favourites, and delete existing favourites.

## Known issues

There are no known issues at this time.
