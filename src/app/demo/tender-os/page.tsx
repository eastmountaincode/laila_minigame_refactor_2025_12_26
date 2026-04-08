export default function TenderOSDemo() {
  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden", background: "#000" }}>
      <iframe
        src="http://localhost:5173"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allow="autoplay"
        title="Tender OS Demo"
      />
    </div>
  );
}
