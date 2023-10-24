# Spottier

A platform for searching sports grounds and matches using geodata.

Description:
The service allows users to find sports grounds and organize matches in various cities and countries.
The main focus of the service is working with geodata, which allows users to select equipped sites that interest them.

Pointer:

<!-- code_chunk_output -->

- [Spottier](#spottier)
   - [Services](#services)
   - [API](#api)
   - [Deploy](#deploy)

<!-- /code_chunk_output -->

Service functionality:

- User registration and authentication: Users can create accounts and log in to use the service.
  
- Search for venues: users can search for venues by various parameters, such as city, country, event type, duration, cost, etc.

- Viewing information about the venues and the matches that took place on them: users can view detailed information about the matches held, including descriptions.

- Match creation: users will be able to create and register teams to participate in matches on any sports field.

- Working with geodata: the service uses geodata to display the location of venues on a map on a map, as well as to provide additional information about sports grounds. Also, users verified by the platform will be able to add playgrounds themselves.

Technologies and DBMS:
To implement the service, you can use the following technologies and DBMS:

- Fastapi framework for developing a web application
- PostgreSQL database for storing information about users, venues and matches.

## Services

1. Authentication Service:

    - Responsible for user registration and authentication.
    - Stores user information in a PostgreSQL database.
    - Provides generation and verification of access tokens for user authorization.

2. Access Management Service:

    - Responsible for managing user access rights
    - Stores information about user access rights in a PostgreSQL database.

3. Venue Management Service:

    - Responsible for adding, editing and deleting sites.
    - Stores information about sites in a PostgreSQL database.

4. Match Management Service:

    - Responsible for creating, editing and deleting matches.
    - Stores match information in a PostgreSQL database.

5. Team management service (Match Management Service):

    - Responsible for creating, editing and deleting commands.
    - Stores information about commands in a PostgreSQL database.




## API

1. User registration and authentication:
    - `POST` **/auth/register** - creating a new user account
    - `POST` **/auth/jwt/login** - user login
    - `POST` **/auth/jwt/logout** - user logout
      </br>
2. Access control based on users and groups:

    - `GET` **/users/me** - getting information about the current user
    - `GET` **/users/{id}** - obtaining information about a specific user
    - `PATCH` **/users/me** - updating information about the current user
    - `PATCH` **/users/{id}** - updating information about a specific user (available only to administrators)
    - `DELETE` **users/{id}** - deleting a user (available only to administrators)
      </br>

3. Search and filtering:
4. Management of sports grounds:
      - `POST` **/spots** - creating a new site
      - `GET` **/spots** - Retrieving all sites
      - `GET` **/spots/{spotId}** - Retrieving specific sites
      - `PATCH` **/spots/{spotId}** - Site update
      - `DELETE` **/spots/{spotId}** - Deleting a site
5. Team management:
      - `POST` **/teams** - creating a new team
      - `GET` **/teams** - Receive all teams
      - `GET` **/teams/{teamId}** - Receiving a team by id
      - `PATCH` **/teams/{teamId}** - Update match by id
      - `DELETE` **/teams/{teamId}** - Deleting a match by id
      - `PATCH` **/teams/{teamId}/add-users/{userId}** - Adding a user to a team
      - `PATCH` **/teams/{teamId}/delete-users/{userId}** - Deleting a user from a team

6. Match management:
      - `POST` **/matches** - creating a new match
      - `GET` **/matches** - Retrieving all matches
      - `GET` **/matches/{matchId}** - Getting a match by id
      - `PATCH` **/matches/{matchId}** - Update match by id
      - `DELETE` **/matches/{matchId}** - Deleting a match by id


## Deploy

### Building and running the project from the root directory
```bash
make -f MakeFile build
```

### Running a project from the root directory
```bash
make -f MakeFile up
```

### Stopping a project from the root directory
```bash
make -f MakeFile down
```

###Service status
```bash
make -f MakeFile status
```
