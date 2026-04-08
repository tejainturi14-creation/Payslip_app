import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function App() {
  const [form, setForm] = useState({
    name: "",
    empId: "",
    salary: "",
    days: "",
    deduction: "",
    salaryMonth: "",
    includePF: false,
  });

  const [result, setResult] = useState(null);
  const payslipRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGenerate = (e) => {
    e.preventDefault();

    const salary = Number(form.salary);
    const deduction = Number(form.deduction);

    const basic = salary * 0.4;
    const hra = salary * 0.6;

    let pfEmp = 0;
    let esiEmp = 0;
    let pfEmployer = 0;
    let esiEmployer = 0;

    if (form.includePF) {
      pfEmp = basic * 0.12;
      esiEmp = salary * 0.0075;
      pfEmployer = basic * 0.12;
      esiEmployer = salary * 0.0325;
    }

    const totalDeduction = deduction + pfEmp + esiEmp;
    const net = salary - totalDeduction;

    const round = (num) => Math.round(num * 100) / 100;

    setResult({
      basic: round(basic),
      hra: round(hra),
      pfEmp: round(pfEmp),
      esiEmp: round(esiEmp),
      pfEmployer: round(pfEmployer),
      esiEmployer: round(esiEmployer),
      totalDeduction: round(totalDeduction),
      net: round(net),
    });
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(payslipRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("payslip.pdf");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      
      {/* COMPANY HEADER ON FORM PAGE */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2 style={{ color: "#1E90FF", fontWeight: "bold" }}>
          SRI VENKATESWARA SECURITY AGENCIES
        </h2>
      </div>

      {/* FORM */}
      <form onSubmit={handleGenerate} style={{ maxWidth: "500px", margin: "auto" }}>
        {[
          ["name", "Employee Name", "text"],
          ["empId", "Employee ID", "text"],
          ["salary", "Salary", "number"],
          ["days", "Working Days", "number"],
          ["deduction", "Deduction", "number"],
          ["salaryMonth", "Salary Month", "text"],
        ].map(([key, label, type]) => (
          <div key={key} style={{ display: "flex", marginBottom: "10px" }}>
            <label style={{ width: "150px", fontWeight: "bold" }}>{label}:</label>
            <input
              name={key}
              type={type}
              value={form[key]}
              onChange={handleChange}
              style={{ flex: 1, padding: "5px" }}
            />
          </div>
        ))}

        <label>
          <input
            type="checkbox"
            name="includePF"
            checked={form.includePF}
            onChange={handleChange}
          />
          Include PF & ESI
        </label>

        <br /><br />

        <button type="submit">Generate</button>
      </form>

      {/* PAYSLIP */}
      {result && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <div
            ref={payslipRef}
            style={{
              padding: "20px",
              border: "2px solid black",
              maxWidth: "100%",
              overflowX: "auto", // scroll if needed
            }}
          >
            {/* COMPANY HEADER */}
            <h2 style={{ color: "#1E90FF", fontWeight: "bold", marginBottom: "20px" }}>
              SRI VENKATESWARA SECURITY AGENCIES
            </h2>

            {/* SALARY MONTH */}
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Salary Month: {form.salaryMonth || "__________"}
            </p>

            {/* TABLE */}
            <table
              border="1"
              width="100%"
              cellPadding="5"
              style={{ borderCollapse: "collapse", tableLayout: "fixed", fontSize: "14px" }}
            >
              <thead>
                <tr>
                  <th style={{ fontWeight: "bold" }}>EMP NAME</th>
                  <th style={{ fontWeight: "bold" }}>ID</th>
                  <th style={{ fontWeight: "bold" }}>SALARY</th>
                  <th style={{ fontWeight: "bold" }}>DAYS</th>
                  <th style={{ fontWeight: "bold" }}>BASIC</th>
                  <th style={{ fontWeight: "bold" }}>HRA</th>
                  <th style={{ fontWeight: "bold" }}>PF EMP</th>
                  <th style={{ fontWeight: "bold" }}>ESI EMP</th>
                  <th style={{ fontWeight: "bold" }}>PF EMPLOYER</th>
                  <th style={{ fontWeight: "bold" }}>ESI EMPLOYER</th>
                  <th style={{ fontWeight: "bold" }}>DEDUCTION</th>
                  <th style={{ fontWeight: "bold" }}>NET</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td style={{ fontWeight: "bold", wordWrap: "break-word" }}>{form.name}</td>
                  <td>{form.empId}</td>
                  <td>{form.salary}</td>
                  <td>{form.days}</td>
                  <td>{result.basic}</td>
                  <td>{result.hra}</td>
                  <td>{result.pfEmp}</td>
                  <td>{result.esiEmp}</td>
                  <td>{result.pfEmployer}</td>
                  <td>{result.esiEmployer}</td>
                  <td>{form.deduction}</td>
                  <td>{result.net}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <br />

          <button onClick={downloadPDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
}

export default App;
