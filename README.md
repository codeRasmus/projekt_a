# User Authentication System

## Beskrivelse

Dette projekt er en simpel brugerautentificeringsapplikation bygget med **Node.js**, **Express**, **SQLite**, og **bcrypt.js**. Applikationen tillader brugere at registrere sig, logge ind og logge ud. Der anvendes bcrypt til at hashe adgangskoder for øget sikkerhed.

## Funktioner

- **Brugerregistrering**: Opret en konto med brugernavn og adgangskode.
- **Brugerlogin**: Log ind med gyldige legitimationsoplysninger.
- **Logout**: Log ud og returnér til login-siden.
- **Sikret adgangskodeopbevaring**: Adgangskoder hashes med bcrypt.js.
- **Brugerdatabase**: Brugerdata gemmes i en SQLite-database.

## Teknologier

- **Node.js**
- **Express.js**
- **EJS** (Embedded JavaScript Templates)
- **SQLite3**
- **bcrypt.js**

## Installation

Følg disse trin for at køre projektet lokalt:

### 1. Klon repository

```sh
$ git clone <repository-url>
$ cd <project-folder>
```

### 2. Installer afhængigheder

```sh
$ npm install
```

### 3. Start serveren

```sh
$ node server.js
```

Serveren kører nu på `http://127.0.0.1:3000/`.

## Filstruktur

```
/project-folder
├── views/          # EJS-skabeloner
│   ├── login.ejs
│   ├── register.ejs
│   ├── welcome.ejs
├── users.db        # SQLite-database
├── server.js       # Hovedserverfil
├── package.json    # Projektkonfiguration
├── README.md       # Dokumentation
```

## Endpoints

| Metode | Route       | Funktion                |
| ------ | ----------- | ----------------------- |
| GET    | `/`         | Redirect til login      |
| GET    | `/login`    | Viser login-side        |
| GET    | `/logout`   | Logger bruger ud        |
| GET    | `/register` | Viser registreringsside |
| POST   | `/login`    | Håndterer login         |
| POST   | `/register` | Håndterer registrering  |

## Sikkerhed

- **Brugernavne valideres** for kun at indeholde alfanumeriske tegn og understregninger.
- **Adgangskoder hashes** ved brug af bcrypt med salt for ekstra sikkerhed.
- **SQL Injection undgås** ved brug af parameteriserede forespørgsler.
