
import React, { useEffect, useState } from "react";
import allRoutes from "./soulsilver_all_routes.json";
import allBosses from "./soulsilver_all_bosses.json";
import pokemonList from "./pokemonList.json";

const getSpriteUrl = (name) =>
  name
    ? `https://play.pokemonshowdown.com/sprites/gen4/${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.png`
    : "https://play.pokemonshowdown.com/sprites/itemicons/poke-ball.png";

const statusIcons = {
  Captured: "✅",
  Dead: "💀",
  Missed: "🌬️",
  Received: "🎁",
  Shiny: "✨",
  Traded: "🔄",
  Trash: "🗑️",
};

function App() {
  const [encounters, setEncounters] = useState({});
  const [defeatedBosses, setDefeatedBosses] = useState([]);
  const sessionId = "soulsilver_duo";

  useEffect(() => {
    const saved = localStorage.getItem(sessionId);
    if (saved) {
      const data = JSON.parse(saved);
      setEncounters(data.encounters || {});
      setDefeatedBosses(data.defeatedBosses || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      sessionId,
      JSON.stringify({ encounters, defeatedBosses })
    );
  }, [encounters, defeatedBosses]);

  const updateEncounter = (route, player, field, value) => {
    const updated = {
      ...encounters,
      [route]: {
        ...encounters[route],
        [player]: {
          ...encounters[route]?.[player],
          [field]: value,
        },
      },
    };
    setEncounters(updated);
  };

  const toggleTeam = (route) => {
    const isInTeam = encounters[route]?.inTeam;
    setEncounters({
      ...encounters,
      [route]: { ...encounters[route], inTeam: !isInTeam },
    });
  };

  const toggleBoss = (boss) => {
    setDefeatedBosses((prev) =>
      prev.includes(boss) ? prev.filter((b) => b !== boss) : [...prev, boss]
    );
  };

  const reset = () => {
    setEncounters({});
    setDefeatedBosses([]);
    localStorage.removeItem(sessionId);
  };

  const players = ["p1", "p2"];
  const statusOptions = [
    "Captured",
    "Dead",
    "Missed",
    "Received",
    "Shiny",
    "Traded",
    "Trash",
  ];

  return (
    <div style={{ padding: 20, backgroundColor: "#0e0e0e", color: "white", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Pokémon SoulSilver Tracker</h1>
      <button onClick={reset} style={{ marginBottom: 20, backgroundColor: "#222", color: "white", padding: "6px 12px", borderRadius: 6 }}>
        🔁 Reset Tracker
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        {players.map((player) => (
          <div key={player} style={{ flex: 1, minWidth: 250 }}>
            <h3>{player.toUpperCase()} – Current Team</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(encounters)
                .filter(([_, data]) => data?.inTeam)
                .map(([route, data]) => {
                  const entry = data[player];
                  return (
                    entry?.name && (
                      <div key={route} style={{ textAlign: "center", background: "#1e1e1e", padding: 6, borderRadius: 8 }}>
                        <img
                          src={getSpriteUrl(entry.name)}
                          alt={entry.name}
                          width={48}
                          height={48}
                        />
                        <div style={{ fontSize: 12 }}>{entry.nickname || ""}</div>
                      </div>
                    )
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {allRoutes.map((route) => (
        <div key={route} style={{ marginTop: 32, background: "#1a1a1a", padding: 16, borderRadius: 12, boxShadow: "0 0 10px rgba(0,0,0,0.3)" }}>
          <h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {route}
            <label>
              <input
                type="checkbox"
                checked={!!encounters[route]?.inTeam}
                onChange={() => toggleTeam(route)}
              />{" "}
              Im Team
            </label>
          </h2>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {players.map((playerKey) => {
              const entry = encounters[route]?.[playerKey] || {};
              return (
                <div key={playerKey} style={{ flex: 1, minWidth: 220 }}>
                  <input
                    list="pokemon-list"
                    value={entry.name || ""}
                    placeholder="Pokémon"
                    style={{ width: "100%", marginBottom: 6, padding: 6, background: "#333", color: "white", border: "none", borderRadius: 4 }}
                    onChange={(e) =>
                      updateEncounter(route, playerKey, "name", e.target.value)
                    }
                  />
                  <input
                    value={entry.nickname || ""}
                    placeholder="Nickname"
                    style={{ width: "100%", marginBottom: 6, padding: 6, background: "#333", color: "white", border: "none", borderRadius: 4 }}
                    onChange={(e) =>
                      updateEncounter(route, playerKey, "nickname", e.target.value)
                    }
                  />
                  <select
                    value={entry.status || ""}
                    onChange={(e) =>
                      updateEncounter(route, playerKey, "status", e.target.value)
                    }
                    style={{
                      width: "100%",
                      marginBottom: 6,
                      padding: 6,
                      background: entry.status === "Dead" ? "#500" : "#333",
                      color: entry.status ? "white" : "#888",
                      border: "none",
                      borderRadius: 4,
                    }}
                  >
                    <option value="" disabled hidden>Status</option>
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {statusIcons[s]} {s}
                      </option>
                    ))}
                  </select>
                  <img
                    src={getSpriteUrl(entry.name)}
                    alt={entry.name}
                    width={48}
                    height={48}
                    style={{ marginTop: 4 }}
                  />
                </div>
              );
            })}
          </div>

          {allBosses
            .filter((boss) => boss.after === route)
            .map((boss) => (
              <div
                key={boss.name}
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: defeatedBosses.includes(boss.name)
                    ? "#24572c"
                    : "#333",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={defeatedBosses.includes(boss.name)}
                    onChange={() => toggleBoss(boss.name)}
                  />{" "}
                  <strong>{boss.name}</strong> – {boss.location}
                </label>
                <img src={boss.sprite} alt={boss.name} height={40} />
              </div>
            ))}
        </div>
      ))}

      <datalist id="pokemon-list">
        {pokemonList.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  );
}

export default App;
