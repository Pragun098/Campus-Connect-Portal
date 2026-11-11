import { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../api.js";

function ActivityTracker() {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState("Checking MongoDB...");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const API_URL = apiUrl("/api/notes");

  // 1. Fetch all notes from MongoDB (GET /api/notes)
  async function fetchNotes() {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { withCredentials: true });
      setNotes(res.data);
      setDbStatus("Connected (student_demo_db)");
      setError(null);
    } catch (err) {
      console.error("Error fetching notes from MongoDB:", err);
      setError("Unable to connect to the server. Check your connection and try again.");
      setDbStatus("Disconnected");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
  }, []);

  // 2. Save a new note into MongoDB (POST /api/notes)
  async function handleAddNote(e) {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      // Body matches PDF: { text: req.body.text }
      const res = await axios.post(API_URL, {
        text: newNoteText.trim()
      }, { withCredentials: true });

      // Append saved document returned by server (PDF: res.status(201).json(newNote))
      setNotes((prev) => [res.data, ...prev]);
      setNewNoteText("");
      setError(null);
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note to MongoDB.");
    }
  }

  // 3. Delete note from MongoDB (DELETE /api/notes/:id)
  async function handleDeleteNote(id) {
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setNotes((prev) => prev.filter((note) => (note._id || note.id) !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note from MongoDB.");
    }
  }

  // 4. Update note in MongoDB (PUT /api/notes/:id)
  async function handleUpdateNote(id) {
    if (!editingText.trim()) return;
    try {
      const res = await axios.put(`${API_URL}/${id}`, {
        text: editingText.trim()
      }, { withCredentials: true });
      setNotes((prev) =>
        prev.map((note) => ((note._id || note.id) === id ? res.data : note))
      );
      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Failed to update note.");
    }
  }

  return (
    <section className="activity-section" id="student-notes">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
        <h2 style={{ margin: 0 }}>Campus Notes &amp; Activity Tracker</h2>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            padding: "4px 12px",
            borderRadius: "20px",
            background: dbStatus.includes("Connected") ? "#dcfce7" : "#fee2e2",
            color: dbStatus.includes("Connected") ? "#166534" : "#991b1b",
            border: dbStatus.includes("Connected") ? "1px solid #bbf7d0" : "1px solid #fecaca",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: dbStatus.includes("Connected") ? "#22c55e" : "#ef4444"
            }}
          />
          MongoDB: {dbStatus}
        </span>
      </div>

      <p style={{ margin: "4px 0 20px 0" }}>
        Manage live student notices, study notes, and campus activities persisted directly in MongoDB (<code>student_demo_db</code>).
      </p>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px"
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Input form matching PDF POST /api/notes */}
      <form onSubmit={handleAddNote} className="activity-input">
        <input
          type="text"
          placeholder="Enter a new campus note or activity (e.g. CS3301 Lab Project Submission)"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
        />
        <button type="submit" disabled={!newNoteText.trim()}>
          Add Note
        </button>
      </form>

      {/* Notes List matching PDF GET /api/notes */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#6b7280", padding: "20px 0" }}>
          Loading notes from MongoDB...
        </p>
      ) : notes.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280", padding: "20px 0", fontStyle: "italic" }}>
          No notes in MongoDB yet. Add your first note above!
        </p>
      ) : (
        <ul className="activity-list" style={{ listStyle: "none", padding: 0, margin: "20px 0" }}>
          {notes.map((note) => {
            const id = note._id || note.id;
            const isEditing = editingId === id;

            return (
              <li
                key={id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#ffffff",
                  border: "1px solid #e1e9e3",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  gap: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #b6c7bd",
                        borderRadius: "6px"
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateNote(id)}
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "13px",
                        background: "#e5e7eb",
                        color: "#374151"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: "14.5px", color: "#2d3748", wordBreak: "break-word" }}>
                      {note.text || note.title}
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(id);
                          setEditingText(note.text || note.title);
                        }}
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          background: "#e2e8f0",
                          color: "#1e293b",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(id)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          background: "#dc2626",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
        <p className="activity-count" style={{ margin: 0, fontWeight: "600", color: "#374151" }}>
          Total Notes in MongoDB: {notes.length}
        </p>
        <button
          type="button"
          onClick={fetchNotes}
          style={{
            background: "transparent",
            border: "1px solid #b6c7bd",
            color: "#326b4d",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </section>
  );
}

export default ActivityTracker;
