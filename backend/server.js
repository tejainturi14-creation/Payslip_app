const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔴 Replace with MongoDB Atlas URL
const MONGO_URI = "mongodb+srv://admin:<db_password>@cluster0.o9qzj9q.mongodb.net/?PAYSLIP_APP=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const EmployeeSchema = new mongoose.Schema({
  name: String,
  empId: String,
  salary: Number,
  workingDays: Number,
  advance: Number,
  deduction: Number,
  includePFESI: Boolean
});

const Employee = mongoose.model("Employee", EmployeeSchema);

// Create employee
app.post("/employee", async (req, res) => {
  const emp = new Employee(req.body);
  await emp.save();
  res.send(emp);
});

// Get all employees
app.get("/employees", async (req, res) => {
  const data = await Employee.find();
  res.send(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));
