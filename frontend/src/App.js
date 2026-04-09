import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "./logo.png";

function App() {
  const [employees, setEmployees] = useState([]);

  // 📥 Excel Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsBinaryString(file);

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const formatted = data
        .map((row) => ({
          name: row["Name"] || "",
          empId: row["EmpId"] || "",
          salary: Number(row["Salary"] || 0),
          days: Number(row["Days"] || 0),
          advance: Number(row["Advance"] || 0),
          deduction: Number(row["Deduction"] || 0),
          salaryMonth: row["Salary Month"] || "",
          includePFESI:
            (row["Include PF ESI"] || "")
              .toString()
              .toLowerCase() === "yes",
        }))
        .filter((emp) => emp.name !== "");

      setEmployees(formatted);
    };
  };

  // 💰 Currency format
  const formatCurrency = (num) =>
    `₹ ${Number(num).toLocaleString("en-IN")}`;

  // 🧮 Calculation
  const calculate = (emp) => {
    const basic = emp.salary * 0.4;
    const hra = emp.salary * 0.6;

    let pfEmp = 0,
      esiEmp = 0,
      pfEmployer = 0,
      esiEmployer = 0;

    if (emp.includePFESI) {
      pfEmp = basic * 0.12;
      esiEmp = emp.salary * 0.0075;
      pfEmployer = basic * 0.12;
      esiEmployer = emp.salary * 0.0325;
    }

    const gross = emp.salary;
    const totalDeduction = emp.deduction + emp.advance + pfEmp + esiEmp;
    const net = gross - totalDeduction;

    const round = (n) => Math.round(n * 100) / 100;

    return {
      basic: round(basic),
      hra: round(hra),
      pfEmp: round(pfEmp),
      esiEmp: round(esiEmp),
      pfEmployer: round(pfEmployer),
      esiEmployer: round(esiEmployer),
      gross: round(gross),
      totalDeduction: round(totalDeduction),
      net: round(net),
    };
  };

  // 📄 Generate PDFs
  const generateAllPDFs = async () => {
    for (let emp of employees) {
      const result = calculate(emp);

      const div = document.createElement("div");

      div.innerHTML = `
      <div style="padding:30px; font-family:Arial; width:700px; margin:auto;">

        <!-- HEADER -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <img src="${logo}" width="70"/>
          <div style="text-align:right;">
            <h2 style="margin:0;">SRI VENKATESWARA SECURITY AGENCIES</h2>
            <p style="margin:5px 0;">Salary Month: ${emp.salaryMonth}</p>
          </div>
        </div>

        <hr/>

        <!-- EMPLOYEE DETAILS -->
        <table width="100%" style="margin:10px 0;">
          <tr>
            <td><b>Employee Name:</b> ${emp.name}</td>
            <td><b>Employee ID:</b> ${emp.empId}</td>
          </tr>
          <tr>
            <td><b>Working Days:</b> ${emp.days}</td>
            <td><b>Gross Salary:</b> ${formatCurrency(emp.salary)}</td>
          </tr>
        </table>

        <!-- EARNINGS / DEDUCTIONS -->
        <table border="1" width="100%" cellpadding="8" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th>Earnings</th>
              <th>Amount</th>
              <th>Deductions</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Basic</td>
              <td>${formatCurrency(result.basic)}</td>
              <td>PF (Employee)</td>
              <td>${formatCurrency(result.pfEmp)}</td>
            </tr>

            <tr>
              <td>HRA</td>
              <td>${formatCurrency(result.hra)}</td>
              <td>ESI (Employee)</td>
              <td>${formatCurrency(result.esiEmp)}</td>
            </tr>

            <tr>
              <td></td>
              <td></td>
              <td>Advance</td>
              <td>${formatCurrency(emp.advance)}</td>
            </tr>

            <tr>
              <td></td>
              <td></td>
              <td>Other Deduction</td>
              <td>${formatCurrency(emp.deduction)}</td>
            </tr>
          </tbody>
        </table>

        <br/>

        <!-- SUMMARY -->
        <table border="1" width="100%" cellpadding="10" style="border-collapse:collapse;">
          <tr>
            <td><b>Total Earnings</b></td>
            <td><b>${formatCurrency(result.gross)}</b></td>
          </tr>
          <tr>
            <td><b>Total Deductions</b></td>
            <td><b>${formatCurrency(result.totalDeduction)}</b></td>
          </tr>
          <tr style="background:#d4f8d4;">
            <td><b>Net Pay</b></td>
            <td><b>${formatCurrency(result.net)}</b></td>
          </tr>
        </table>

        <br/>

        <!-- EMPLOYER CONTRIBUTION -->
        <p><b>PF (Employer):</b> ${formatCurrency(result.pfEmployer)}</p>
        <p><b>ESI (Employer):</b> ${formatCurrency(result.esiEmployer)}</p>

        <br/><br/>

        <!-- FOOTER -->
        <p style="text-align:center; font-size:12px; color:gray;">
          This is a system-generated payslip and does not require a physical signature.
        </p>

      </div>
      `;

      document.body.appendChild(div);

      const canvas = await html2canvas(div, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth * 0.9;

      const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

      const x = (pdfWidth - imgWidth) / 2;
      const y = 10;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      // 🔥 FILE NAME FIX
      const safeMonth = (emp.salaryMonth || "month")
        .replace(/\s+/g, "_");

      const safeName = (emp.name || "employee")
        .replace(/\s+/g, "_");

      pdf.save(`${safeName}_${safeMonth}_payslip.pdf`);

      document.body.removeChild(div);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Excel File</h2>

      <input type="file" onChange={handleFileUpload} />

      <br /><br />

      <button onClick={generateAllPDFs}>
        Generate All Payslips
      </button>

      <br /><br />

      {employees.length > 0 && (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Salary</th>
              <th>Advance</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => {
              const res = calculate(emp);
              return (
                <tr key={i}>
                  <td>{emp.name}</td>
                  <td>{emp.empId}</td>
                  <td>{formatCurrency(emp.salary)}</td>
                  <td>{formatCurrency(emp.advance)}</td>
                  <td>{formatCurrency(res.net)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
