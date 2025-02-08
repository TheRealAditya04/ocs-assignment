import React, { useState } from "react";

const BACKEND_URL = "http://localhost:3001"; // ✅ Back to local server

const App = () => {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setData(null);

    console.log("🔵 Sending request with:", { userid, password });

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {  
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, password }),
      });

      const result = await response.json();
      console.log("🟢 Login response:", result);

      if (result.success) {
        console.log("🔵 Fetching user data for:", userid, "Role:", result.role);

        const dataResponse = await fetch(`${BACKEND_URL}/getUserData`, {  
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid, role: result.role }),
        });

        const dataResult = await dataResponse.json();
        console.log("🟢 Data fetch response:", dataResult);

        if (dataResult.success) {
          setData({ role: result.role, userid, table: dataResult.table }); 
        } else {
          setError(dataResult.message);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error connecting to server.");
      console.error("🔴 Error:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="User ID"
        value={userid}
        onChange={(e) => setUserid(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h3>Login Successful!</h3>
          <p>Role: {data.role}</p>

          {data.table && data.table.length > 0 ? (
            <div>
              <h3>{data.role === "admin" ? "All Users Data" : "Your Data"}</h3>
              <table border="1" style={{ margin: "auto" }}>
                <thead>
                  <tr>
                    {Object.keys(data.table[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.table.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "gray", fontStyle: "italic" }}>
              ⚠️ No data available.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
