import { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function InvoiceDemo() {
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [mwst, setMwst] = useState(7.7);
  const [invoiceList, setInvoiceList] = useState([]);
  const [clients, setClients] = useState([]);
  const [counter, setCounter] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [logo, setLogo] = useState(null);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const storedInvoices = localStorage.getItem("invoiceList");
    const storedClients = localStorage.getItem("clients");
    const storedCounter = localStorage.getItem("invoiceCounter");
    const storedLogo = localStorage.getItem("invoiceLogo");
    if (storedInvoices) setInvoiceList(JSON.parse(storedInvoices));
    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedCounter) setCounter(parseInt(storedCounter));
    if (storedLogo) setLogo(storedLogo);
  }, []);

  useEffect(() => {
    localStorage.setItem("invoiceList", JSON.stringify(invoiceList));
  }, [invoiceList]);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("invoiceCounter", counter.toString());
  }, [counter]);

  useEffect(() => {
    if (logo) localStorage.setItem("invoiceLogo", logo);
  }, [logo]);

  const addClient = () => {
    if (!client) return;
    setClients([...clients, { name: client, id: Date.now() }]);
    setClient("");
  };

  const createInvoice = () => {
    if (!client || !amount) return;
    const invoice = {
      id: Date.now(),
      client,
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString(),
      status: "Offen",
      number: `RE-${String(counter).padStart(4, "0")}`,
      description,
      mwst,
      dueDate,
    };
    setInvoiceList([invoice, ...invoiceList]);
    setCounter(counter + 1);
    setClient("");
    setAmount("");
    setDescription("");
    setDueDate("");
  };

  const generatePDF = (inv) => {
    const doc = new jsPDF();
    doc.setFontSize(12);

    if (logo) {
      doc.addImage(logo, "PNG", 150, 10, 40, 20);
    }

    doc.text(`Rechnung ${inv.number}`, 20, 20);
    doc.text(`Datum: ${inv.date}`, 20, 30);
    doc.text(`Kunde: ${inv.client}`, 20, 40);
    doc.text(`Beschreibung: ${inv.description}`, 20, 50);
    doc.text(`Betrag: CHF ${inv.amount.toFixed(2)}`, 20, 60);
    const mwstBetrag = (inv.amount * (inv.mwst / 100)).toFixed(2);
    doc.text(`MWST (${inv.mwst}%): CHF ${mwstBetrag}`, 20, 70);
    const total = (inv.amount + parseFloat(mwstBetrag)).toFixed(2);
    doc.text(`Gesamtbetrag: CHF ${total}`, 20, 80);
    doc.save(`${inv.number}.pdf`);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const exportCSV = () => {
    const rows = [
      [
        "Rechnungsnummer",
        "Kunde",
        "Betrag",
        "Datum",
        "Status",
        "Beschreibung",
        "MWST",
        "Fälligkeitsdatum",
      ],
    ];
    invoiceList.forEach((inv) => {
      rows.push([
        inv.number,
        inv.client,
        inv.amount,
        inv.date,
        inv.status,
        inv.description,
        `${inv.mwst}%`,
        inv.dueDate,
      ]);
    });
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rechnungen.csv";
    link.click();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Rechnungs-Demo mit Kundenverwaltung</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "block", marginBottom: "10px" }} />
      </div>

      <h2 style={{ color: "#555" }}>Rechnung erstellen</h2>
      <input
        type="number"
        placeholder="Betrag in CHF"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
      />
      <input
        type="text"
        placeholder="Beschreibung"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
      />
      <input
        type="number"
        placeholder="MWST %"
        value={mwst}
        onChange={(e) => setMwst(parseFloat(e.target.value))}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
      />
      <input
        type="date"
        placeholder="Fälligkeitsdatum"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
      />
      <button
        onClick={createInvoice}
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Rechnung erstellen
      </button>

      <h2 style={{ color: "#555", marginTop: "40px" }}>Rechnungen</h2>
      <input
        type="text"
        placeholder="Suchen nach Kunde oder Nummer"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
      />
      <button
        onClick={exportCSV}
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        CSV Export
      </button>
      {invoiceList.map((inv) => (
        <div key={inv.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "15px", borderRadius: "5px" }}>
          <div><strong>Rechnungsnummer:</strong> {inv.number}</div>
          <div><strong>Kunde:</strong> {inv.client}</div>
          <div><strong>Betrag:</strong> CHF {inv.amount.toFixed(2)}</div>
          <div><strong>Datum:</strong> {inv.date}</div>
          <div><strong>Status:</strong> {inv.status}</div>
          <div><strong>Beschreibung:</strong> {inv.description}</div>
          <div><strong>MWST:</strong> {inv.mwst}%</div>
          <div><strong>Fälligkeitsdatum:</strong> {inv.dueDate}</div>
          <button
            onClick={() => generatePDF(inv)}
            style={{
              marginTop: "10px",
              marginRight: "10px",
              padding: "8px 15px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            PDF herunterladen
          </button>
          <button
            onClick={() => editInvoice(inv)}
            style={{
              marginTop: "10px",
              marginRight: "10px",
              padding: "8px 15px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Bearbeiten
          </button>
          <button
            onClick={() => deleteInvoice(inv.id)}
            style={{
              marginTop: "10px",
              padding: "8px 15px",
              backgroundColor: "#F44336",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Löschen
          </button>
        </div>
      ))}
    </div>
  );
}
