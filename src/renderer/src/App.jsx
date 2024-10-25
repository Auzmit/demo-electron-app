import { useState } from "react"

function App() {
  const [tables, setTables] = useState([]);

  return (
    <>
      <button onClick={() => window.api.showOpenDialog()}>Import database</button>
      <table>
        <thead></thead>
        <tbody></tbody>
      </table>
    </>
  )
}

export default App

