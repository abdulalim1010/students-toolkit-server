// index.js
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");


const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.emeucb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let usersCollection

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected!");
    
    const database = client.db("toolkit");
    usersCollection = database.collection("users");
  } catch (err) {
    console.error(err);
  }
}
run();

// Test route
app.get("/", (req, res) => {
  res.send("Hello from Backend Server 🚀");
});


app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new user
app.post("/users", async (req, res) => {
  try {
    const newUser = req.body; // JSON body: { "name": "...", "email": "..." }
    const result = await usersCollection.insertOne(newUser);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
