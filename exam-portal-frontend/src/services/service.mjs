import express from 'express'; // Use import for express
import fetch from 'node-fetch'; // Use import for node-fetch
import cors from 'cors'; // Import the CORS middleware

const app = express();
const port = 5000;

// Use the CORS middleware
app.use(cors()); 
app.use(express.json());  // Parse incoming JSON request bodies

app.post("/execute-code", async (req, res) => {
  const { code, language } = req.body;

  try {
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: "185619fcb518ac6c8b0b1b5904e0ca69",  // Replace with your JDoodle client ID
        clientSecret: "40311d319c3fab08b7fa59d3b01da58833805d61c2b19cb374c484e927d90091",  // Replace with your JDoodle client secret
       script: code,  // Code you want to execute
        language: language,  // Language, e.g., 'csharp'
        versionIndex: "0",  // Version index (0 for the latest)
      }),
    });

    const data = await response.json();
    res.json(data);  // Send the data back to the frontend
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ error: "Error executing code" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
