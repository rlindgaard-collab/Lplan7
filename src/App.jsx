import React from "react";
import { useState } from "react";
import * as pdfjsLib from 'pdfjs-dist/webpack';

const SUPABASE_URL = "https://https://fjwpfesqfwtozaciphnc.functions.supabase.co";

async function callEdgeFunction(name, body) {
  const res = await fetch(`${SUPABASE_URL}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Fejl i edge function");
  }

  return res.json();
}

export default function App() {
  const [text, setText] = useState("");
  const [profile, setProfile] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function(e) {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Vælg venligst en PDF fil');
      return;
    }

    setLoading(true);
    try {
      const extractedText = await extractTextFromPDF(file);
      setText(extractedText);
      setPdfUploaded(true);
    } catch (error) {
      console.error('Fejl ved læsning af PDF:', error);
      alert('Fejl ved læsning af PDF fil');
    }
    setLoading(false);
  }

  async function handleSuggest() {
    setLoading(true);
    const data = await callEdgeFunction("forslag", { text, profile });
    setSuggestion(data.suggestion);
    setLoading(false);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Læringsplan App</h1>

      {!pdfUploaded ? (
        <div style={{ marginBottom: "2rem" }}>
          <label htmlFor="pdf-upload" style={{ display: "block", marginBottom: "0.5rem" }}>
            Upload PDF fil:
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={loading}
          />
          {loading && <p>Læser PDF...</p>}
        </div>
      ) : (
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: "green" }}>✓ PDF uploadet og læst</p>
          <button 
            onClick={() => {
              setPdfUploaded(false);
              setText("");
              setSuggestion("");
            }}
            style={{ fontSize: "0.8rem" }}
          >
            Upload ny PDF
          </button>
        </div>
      )}

      {pdfUploaded && (
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="profile-input" style={{ display: "block", marginBottom: "0.5rem" }}>
            Vælg profil/kompetencemål:
          </label>
          <input
            id="profile-input"
            type="text"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Indtast profil/kompetencemål"
            style={{ width: "400px", padding: "0.5rem" }}
          />
        </div>
      )}

      {pdfUploaded && (
        <div style={{ marginBottom: "2rem" }}>
          <button 
            onClick={handleSuggest}
            disabled={loading || !profile.trim()}
            style={{ 
              padding: "0.75rem 1.5rem", 
              fontSize: "1rem",
              backgroundColor: loading || !profile.trim() ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || !profile.trim() ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Laver forslag..." : "Lav forslag til aktivitet"}
          </button>
        </div>
      )}

      {text && (
        <details style={{ marginBottom: "2rem" }}>
          <summary>Vis udtrukket tekst fra PDF</summary>
          <textarea
            rows={8}
            cols={80}
            value={text}
            readOnly
            style={{ marginTop: "0.5rem", width: "100%" }}
          />
        </details>
      )}

      {suggestion && (
        <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
          <h2>Forslag til aktivitet:</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{suggestion}</p>
        </div>
      )}
    </div>
  );
}
        <input
          type="text"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="Indtast profil/kompetencemål"
          style={{ width: "400px" }}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleSummarize} style={{ marginRight: "1rem" }}>
          Opsummer
        </button>
        <button onClick={handleSuggest}>Lav forslag</button>
      </div>

      {summary && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Opsummering:</h2>
          <p>{summary}</p>
        </div>
      )}

      {suggestion && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Forslag:</h2>
          <p>{suggestion}</p>
        </div>
      )}
    </div>
  );
}
