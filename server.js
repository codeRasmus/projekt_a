const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;
const ip = "127.0.0.1";

app.set("view engine", "ejs");
app.set("views", "./views");

const db = new sqlite3.Database("users.db", (err) => {
  if (err) {
    console.error("Fejl ved oprettelse af database", err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userid TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

app.use(express.static("views"));

app.use(express.urlencoded({ extended: true }));

// Redirect root route to login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Serve the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/logout", (req, res) => {
  res.redirect("/login");
});

// Serve the register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

// Function to add a new user
function addUser(userid, password, res) {
  try {
    // Check if username contains valid characters
    if (!/^[a-zA-Z0-9_]+$/.test(userid)) {
      res
        .status(400)
        .send(
          "❌ Invalid username. Only letters, numbers and underscores are allowed."
        );
      return;
    }

    // Check if username already exists in the database
    db.get("SELECT * FROM user WHERE userid = ?", [userid], (err, row) => {
      if (err) {
        res.status(500).send("Fejl ved databaseforespørgsel.");
        return;
      }

      if (row) {
        res
          .status(400)
          .send("⛔ Brugernavnet er allerede taget, vælg venligst et andet.");
        return;
      }

      // Generate salt and hash password
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          res.status(500).send("Fejl ved generering af salt.");
          return;
        }

        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            res.status(500).send("Fejl ved hashing af password.");
            return;
          }

          // Insert the new user into the database
          const stmt = db.prepare(
            "INSERT INTO user (userid, password) VALUES (?, ?)"
          );
          stmt.run(userid, hash, function (err) {
            if (err) {
              res.status(500).send("Fejl ved indsættelse i database.");
              return;
            }
            stmt.finalize();
            res.sendFile(path.join(__dirname, "views", "login.html"));
          });
        });
      });
    });
  } catch (error) {
    res.status(500).send("Fejl: " + error.message);
  }
}

// Function to handle user login
function authenticateUser(userid, password, res) {
  db.get("SELECT * FROM user WHERE userid = ?", [userid], (err, row) => {
    if (err) {
      res.status(500).send("Fejl ved databaseforespørgsel.");
      return;
    }

    if (!row) {
      res.status(400).send("⛔ Brugernavnet findes ikke.");
      return;
    }

    bcrypt.compare(password, row.password, (err, isMatch) => {
      if (err) {
        res.status(500).send("Fejl ved password sammenligning.");
        return;
      }

      if (isMatch) {
        res.render("welcome", {
          username: userid,
          createdAt: row.created_at,
          password: password,
        });
      } else {
        res.status(400).send("⛔ Forkert adgangskode.");
      }
    });
  });
}

// Handle user login (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("❌ Brugernavn og adgangskode kræves.");
  }
  authenticateUser(username, password, res);
});

// Handle user registration (POST)
app.post("/register", (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    return res.status(400).send("❌ Brugernavn og adgangskode kræves.");
  }
  addUser(userid, password, res);
});

app.listen(port, ip, () => {
  console.log(`Server kører på http://${ip}:${port}/`);
});
