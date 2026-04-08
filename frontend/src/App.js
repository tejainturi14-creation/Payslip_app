import React, { useEffect, useState } from "react";
import axios from "axios";

const API = " https://payslip-app-03gk.onrender.com"; // 👈 change after deploy

function App() {
  const [form, setForm] = useState({
    name: "",
    empId: "",
    salary: "",
    workingDays: "",
    advance: "",
    deduction: "",
    includePFESI: true
  });

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const res = await axios.get(`${API}/employees`);
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    await axios.post(`${API}/employee`, form);
    fetchEmployees();
  };

  const calculate = (emp) => {
    const salary = Number(emp.salary || 0);
    const basic = salary * 0.4;
    const hra = salary - basic;

    const pf = emp.includePFESI ? basic * 0.12 : 0;
    const esi = emp.includePFESI ? salary * 0.0075 : 0;

    const total = pf + esi + Number(emp.advance || 0) + Number(emp.deduction || 0);
    const net = salary - total;

    return { basic, hra, pf, esi, net };
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Payslip Generator</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="empId" placeholder="ID" onChange={handleChange} />
      <input name="salary" placeholder="Salary" onChange={handleChange} />
      <input name="workingDays" placeholder="Working Days" onChange={handleChange} />
      <input name="advance" placeholder="Advance" onChange={handleChange} />
      <input name="deduction" placeholder="Deduction" onChange={handleChange} />

      <label>
        <input type="checkbox" name="includePFESI" onChange={handleChange} />
        Include PF & ESI
      </label>

      <button onClick={handleSubmit}>Add</button>

      {employees.map((emp, i) => {
        const c = calculate(emp);
        return (
          <div key={i} style={{ border: "1px solid black", marginTop: 20 }}>
            <h3>{emp.name}</h3>
            <p>Net Pay: ₹{c.net.toFixed(2)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default App;
