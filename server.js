const express = require("express");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;
const ip = "127.0.0.1";

// Setup EJS
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("views"));
app.use(express.urlencoded({ extended: true }));

// Initializing database connection
const db = new sqlite3.Database("users.db", (err) => {
  if (err) {
    console.error("Fejl ved oprettelse af database", err.message);
    process.exit(1);
  }
  console.log("Database oprettet/forbundet");
});

// Create user table if it doesn't exist
// db.serialize(() => {
//   db.run(
//     `CREATE TABLE IF NOT EXISTS user (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       userid TEXT NOT NULL UNIQUE,
//       password TEXT NOT NULL,
//       created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     )`
//   );
// });

// Redirect root route to login page
app.get("/", (req, res) => {
  console.log("Root routing til /login");
  res.redirect("/login");
});

// Serve the login page
app.get("/login", (req, res) => {
  console.log("Serverer login side");
  res.render("login", { error: null }); // Send 'error' selv hvis den er tom
});

// Logout route
app.get("/logout", (req, res) => {
  console.log("Bruger logger ud");
  res.redirect("/login");
});

// Serve the register page
app.get("/register", (req, res) => {
  console.log("Serverer register side");
  res.render("register", { error: null }); // Render EJS register page
});

// Function to add a new user
function addUser(userid, password, res) {
  if (!/^[a-zA-Z0-9_]+$/.test(userid)) {
    return res.render("register", {
      error: "❌ Ugyldigt brugernavn.",
    });
  }

  db.get("SELECT * FROM user WHERE userid = ?", [userid], (err, row) => {
    if (err) {
      return res.render("register", {
        error: "Fejl ved databaseforespørgsel.",
      });
    }

    if (row) {
      return res.render("register", {
        error: "⛔ Brugernavnet er allerede taget.",
      });
    }

    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        return res.render("register", {
          error: "Fejl ved generering af salt.",
        });
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return res.render("register", {
            error: "Fejl ved hashing af password.",
          });
        }

        const stmt = db.prepare(
          "INSERT INTO user (userid, password) VALUES (?, ?)"
        );
        stmt.run(userid, hash, function (err) {
          if (err) {
            return res.render("register", {
              error: "Fejl ved indsættelse i database.",
            });
          }
          stmt.finalize();
          console.log(userid, "oprettet i databasen");
          res.redirect("/login");
        });
      });
    });
  });
}

// Function to handle user login
function authenticateUser(userid, password, res) {
  console.log("Forsøger at godkende bruger:", userid);

  db.get("SELECT * FROM user WHERE userid = ?", [userid], (err, row) => {
    if (err) {
      return res.render("login", { error: "Fejl ved databaseforespørgsel." });
    }

    if (!row) {
      return res.render("login", { error: "⛔ Brugernavnet findes ikke." });
    }

    bcrypt.compare(password, row.password, (err, isMatch) => {
      if (err) {
        return res.render("login", {
          error: "Fejl ved password sammenligning.",
        });
      }

      if (isMatch) {
        console.log("Login succesfuldt");
        console.log("Serverer welcome side");
        return res.render("welcome", {
          username: userid,
          createdAt: row.created_at,
          password: password,
        });
      } else {
        return res.render("login", { error: "⛔ Forkert adgangskode." });
      }
    });
  });
}

// Handle user login (POST)
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username, "forsøger login");

  if (!username || !password) {
    return res.render("login", {
      error: "❌ Brugernavn og adgangskode kræves.",
    });
  }
  authenticateUser(username, password, res);
});

// Handle user registration (POST)
app.post("/register", (req, res) => {
  const userid = req.body.userid;
  const password = req.body.password;
  console.log(userid, "forsøger at oprette bruger");

  if (!userid || !password) {
    return res.render("register", {
      error: "❌ Brugernavn og adgangskode kræves.",
    });
  }
  addUser(userid, password, res);
});

// Start the server
app.listen(port, ip, () => {
  console.log(`Server kører på http://${ip}:${port}/`);
});
