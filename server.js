const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(5000, () => {
      console.log(`server running at http://localhost:5000`);
    });
  } catch (error) {
    console.log(`DB Error at ${error.message}`);
  }
};

initializeDbAndServer();
app.use(express.json());

//GET API method
app.get("/home", async (request, response) => {
  const query = `select * from user`;
  let data = await db.all(query);
  response.send(data);
});

//POST API method
app.post("/create/", async (request, response) => {
  const { name, Id, role } = request.body;
  const query = `
    INSERT INTO USER(id,name,role)
    VALUES(${Id},"${name}","${role}")`;

  let data = await db.run(query);
  let msg = `Successfully added the name ${name}`;
  let arrMsg = [msg];
  response.send(arrMsg);
});
