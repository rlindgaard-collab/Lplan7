import { useState } from "react";

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
  const [summary, setSummary] = useState("");
  const [suggestion, setSuggestion] = useState("");

  async function handleSummarize() {
    const data = await callEdgeFunction("opsummering", { text });
    setSummary(data.summary);
  }

  async function handleSuggest() {
    const data = await callEdgeFunction("forslag", { text, profile });
    setSuggestion(data.suggestion);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Læringsplan App</h1>

      <textarea
        rows={8}
        cols={60}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Indsæt tekst fra PDF her..."
      />

      <div style={{ marginTop: "1rem" }}>
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
