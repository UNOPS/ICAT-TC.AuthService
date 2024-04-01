# TC-Tool - Auth Service

Auth service for authentication service in TC Tool - TC-Tool.

Supported by [Initiative for Climate Action Transparency - ICAT](https://climateactiontransparency.org/).

Built using [Node.js 20.9.0](https://nodejs.org/dist/latest-v16.x/docs/api/) and [Nest](https://github.com/nestjs/nest) framework.

## Database Configuration

This application uses a [MySQL Database](https://www.mysql.com/). The `Auth.sql` configuration file containing the database schema and some dummy data is provided in the root folder.

## Manual Installation

1. Download and install the [Node.js 20.9.0 LTS version](https://nodejs.org/en/download/releases) for your operational system.

2. Download or clone this repository.

3. In the terminal, go to this repository's main folder.

4. Install the NPM dependencies (including Nest) with the command:


```bash
$ npm install --force
```

5. Set up the Environment Variables

  - In the machine:
    - **Windows:** using the `set` command in the terminal
    - **Linux/MacOS:** using the `export` command in the terminal

  - Or creating a `.env` file using `.env.example` as base

6. Run the app:

```bash
$ npm run start
```
## Google Cloud Installation with Docker

> This is an example cloud installation using [Docker](https://www.docker.com/) and Google Cloud Plataform. The provided `Dockerfile` can be used for local or cloud installation with different services.

1. In GCP Console, go to [Artifact Registry](https://console.cloud.google.com/artifacts) and enable the Artifact Registry API

2. In the Artifact Registry, create a new repository:

   - **Format:** Docker
   - **Type:** Standard
   - **Location:** desired application location
   - **Encryption:** Google-managed key

3. Download and install [gcloud CLI](https://cloud.google.com/sdk/docs/install).

4. Download or clone this repository.

5. In the terminal, go to this repository's main folder.

6. Build your container in the Artifacts Register using the provided `Dockerfile`. The container path can be found on the Artifact Registry's repository page.

  ```bash
  $ gcloud builds submit --tag [CONTAINER PATH]
  ```

7. Go to [Cloud Run](https://console.cloud.google.com/run) and create a New Service:
   - Choose the option `Deploy one revision from an existing container image` and select the container image updated in the previous step
   - Add a service name
   - Select the application region
   - Select `Allow unauthenticated invocations` in the Authentication option
   - In the **Container section**:
     - Select Container port 7090
     - Add the Environment Variables
     - Add the Cloud SQL connections

> Noticed that some [special permissions in GCP](https://cloud.google.com/run/docs/reference/iam/roles#additional-configuration) can be necessary to perform these tasks.

## Environment Variables

The environment variables should be declared as follow:

| Variable name                            | Description                                    |
| -----------------------------------------| ---------------------------------------------- |
| `PORT`                                   | Application Port(*)                            |
| `DATABASE_HOST`                          | Database Host(*)                               |
| `SOCKET_PATH`                            | Database Socket Path(*)                        |
| `DATABASE_PORT`                          | Database Port(*)                               |
| `DATABASE_USER`                          | Database User(*)                               |
| `DATABASE_PASSWORD`                      | Database Password (*)                          |
| `DATABASE_NAME`                          | Database Name(*)                               |
| `MAIN_SERVICE_URL`                       | main service url(*)                            |
| `EMAIL_CONFIRMATION_URL`                 | email confirmation url(*)                      |
| `WEB_SERVER_LOGIN`                       | Web login url(*)                               |
| `WEB_SERVER_RESET_PASSWORD`              | Web reset url(*)                               |
| `AUDIT_URL`                              | Audit service url(*)                           |
| `EMAIL`                                  | email address for mail service(*)              |
| `EMAIL_PASSWORD`                         | main password(*)                               |
| `EMAIL_HOST`                             | email host(*)                                  |
| `JWT_VERIFICATION_TOKEN_SECRET`          | jwt verification token(*)                      |
| `JWT_REFRESH_KEY`                        | jwt refresh key(*)                             |
| `JWT_VERIFICATION_TOKEN_EXPIRATION_TIME` |jwt verification token expiration tome(*)       |
| `JWT_REFRESH_EXPIRATION_TIME`            |jwt refresh expiration tome(*)                  |


> (*) Can be used the Database Host or the Database Socket Path depending of the database configuration

## API Documentation

After the application installation, the API Documentation is available in the application URL + `/api/` with [Swagger](https://swagger.io/solutions/api-documentation/).



## License

  Nest is [MIT licensed](LICENSE).





