// index.js
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const nodemailer = require("nodemailer");


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
let examsCollection
let attendanceCollection
let feesCollection;
let notificationsCollection;

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected!");
    
    const database = client.db("toolkit");
    usersCollection = database.collection("users");
    examsCollection = database.collection("exams");
    attendanceCollection = database.collection("attendance");
    feesCollection = database.collection("fees");
    notificationsCollection = database.collection("notifications");
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

///emails 
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Nodemailer transporter setup
    let transporter = nodemailer.createTransport({
      service: "gmail", // or outlook, yahoo etc.
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    // Mail options
   let mailOptions = {
  from: process.env.EMAIL_USER, // তোমার gmail address
  replyTo: email,               // ইউজারের email reply হিসেবে যাবে
  to: process.env.EMAIL_USER,
  subject: `New Contact Message from ${name}`,
  text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
};

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Routes
// Get all exams
app.get("/api/exams", async (req, res) => {
  try {
    const exams = await examsCollection.find().sort({ date: 1 }).toArray(); // ascending by date
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new exam
app.post("/api/exams", async (req, res) => {
  try {
    const newExam = req.body; // { subject, date, description }
    const result = await examsCollection.insertOne(newExam);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//attendance api
// Attendance API
// Attendance API
app.get("/api/attendance", async (req, res) => {
  try {
    const attendance = await attendanceCollection.find().toArray();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const newAttendance = req.body; 
    // Example: { studentId: "123", date: "2025-09-10", status: "Present" }
    const result = await attendanceCollection.insertOne(newAttendance);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//fees api 

// Get all fees
app.get("/api/fees", async (req, res) => {
  try {
    const fees = await feesCollection.find().toArray();
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new fee record
app.post("/api/fees", async (req, res) => {
  try {
    const newFee = req.body;
    /* Example JSON:
      {
        "studentId": "STU001",
        "admissionFee": 5000,
        "tuitionFee": 2000,
        "seminarFee": 500,
        "formFillupFee": 800,
        "labFee": 1000,
        "paidDate": "2025-09-10"
      }
    */
    const result = await feesCollection.insertOne(newFee);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await notificationsCollection
      .find()
      .sort({ createdAt: -1 }) // latest first
      .toArray();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new notification
app.post("/api/notifications", async (req, res) => {
  try {
    const newNotification = {
      ...req.body,
      createdAt: new Date(),
    };
    const result = await notificationsCollection.insertOne(newNotification);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
