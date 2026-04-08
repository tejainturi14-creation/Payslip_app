import React, { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [basic, setBasic] = useState("");
  const [days, setDays] = useState("");
  const [allowance, setAllowance] = useState("");
  const [deduction, setDeduction] = useState("");
  const [includePF, setIncludePF] = useState(false);
  const [result, setResult] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault(); // 🔴 prevents page refresh

    const basicNum = Number(basic);
    const allowanceNum = Number(allowance);
    const deductionNum = Number(deduction);

    let pf = 0;
    let esi = 0;

    if (includePF) {
      pf = basicNum * 0.12;
      esi = basicNum * 0.0175;
    }

    const gross = basicNum + allowanceNum;
    const totalDeduction = deductionNum + pf + esi;
    const net = gross - totalDeduction;

    setResult({
      gross,
      pf,
      esi,
      totalDeduction,
      net,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Payslip Generator</h1>

      <form onSubmit={handleAdd}>
        <input
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br /><br />

        <input
          placeholder="Employee ID"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
        /><br /><br />

        <input
          placeholder="Basic Salary"
          type="number"
          value={basic}
          onChange={(e) => setBasic(e.target.value)}
        /><br /><br />

        <input
          placeholder="Working Days"
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        /><br /><br />

        <input
          placeholder="Allowance"
          type="number"
          value={allowance}
          onChange={(e) => setAllowance(e.target.value)}
        /><br /><br />

        <input
          placeholder="Other Deductions"
          type="number"
          value={deduction}
          onChange={(e) => setDeduction(e.target.value)}
        /><br /><br />

        <label>
          <input
            type="checkbox"
            checked={includePF}
            onChange={(e) => setIncludePF(e.target.checked)}
          />
          Include PF & ESI
        </label>

        <br /><br />

        <button type="submit">Add</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Payslip</h2>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Employee ID:</strong> {empId}</p>
          <p><strong>Gross Salary:</strong> {result.gross}</p>
          <p><strong>PF:</strong> {result.pf}</p>
          <p><strong>ESI:</strong> {result.esi}</p>
          <p><strong>Total Deduction:</strong> {result.totalDeduction}</p>
          <h3><strong>Net Salary: {result.net}</strong></h3>
        </div>
      )}
    </div>
  );
}

export default App;
