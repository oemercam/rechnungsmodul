
import { useState } from "react";

export default function InvoiceDemo() {
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceList, setInvoiceList] = useState([]);

  const createInvoice = () => {
    if (!client || !amount) return;
    const invoice = {
      id: Date.now(),
      client,
      amount,
      date: new Date().toLocaleDateString(),
      status: "Offen",
    };
    setInvoiceList([invoice, ...invoiceList]);
    setClient("");
    setAmount("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Rechnungs-Demo</h1>
      <input
        type="text"
        placeholder="Kundenname"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px" }}
      />
      <input
        type="number"
        placeholder="Betrag in CHF"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px" }}
      />
      <button onClick={createInvoice}>Rechnung erstellen</button>

      <div style={{ marginTop: "20px" }}>
        {invoiceList.map((inv) => (
          <div key={inv.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <div><strong>Kunde:</strong> {inv.client}</div>
            <div><strong>Betrag:</strong> CHF {inv.amount}</div>
            <div><strong>Datum:</strong> {inv.date}</div>
            <div><strong>Status:</strong> {inv.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
