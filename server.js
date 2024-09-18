const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
let db = null;
let port = process.env.PORT || 8000;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(8000, () => {
      console.log(`server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(`DB Error at ${error.message}`);
  }
};

initializeDbAndServer();
app.use(express.json());

//GET API method
app.get("/userDetails", async (request, response) => {
  const query = `select * from userInfo`;
  const data = await db.all(query);
  response.send(data);
});

//POST Register API method

app.post("/register", async (request, response) => {
  const { username, gender, password } = request.body;
  const encrypted = await bcrypt.hash(password, 10);
  const getQuery = `select * from userInfo where username='${username}'`;
  const data = await db.get(getQuery);
  if (data === undefined) {
    const id = uuidv4();
    const query = `
          INSERT INTO userInfo(id,username,gender,password)
          values('${id}','${username}','${gender}','${encrypted}')
      `;
    await db.run(query);
    response.send(["Successfully Registered"]);
  } else {
    response.status(400);
    response.send(["User already exists"]);
  }
});

//POST Login API
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const getQuery = `select * from userInfo where username = '${username}'`;
  const getData = await db.get(getQuery);
  if (getData === undefined) {
    response.status(400);
    response.send(["Invalid User"]);
  } else {
    const isMatch = await bcrypt.compare(password, getData.password);
    if (isMatch === true) {
      response.send(["Login Success"]);
    } else {
      response.status(400);
      response.send(["Invalid Password"]);
    }
  }
});
