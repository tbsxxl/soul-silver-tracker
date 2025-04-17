import React, { useEffect, useState } from "react";
import allRoutes from "./soulsilver_all_routes.json";
import allBosses from "./soulsilver_all_bosses.json";
import pokemonList from "./pokemonList.json";
import 'font-awesome/css/font-awesome.min.css';
import styles from "./styles.json";

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

const statusColors = {
  Captured: "#3B82F6",  // Blau
  Dead: "#EF4444",      // Rot
  Missed: "#9E9E9E",    // Grau
  Received: "#22C55E",   // Grün
  Shiny: "#FBBF24",      // Gold
  Traded: "#FB923C",     // Orange
  Trash: "#6B7280",      // Dunkelgrau
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
    // Speichert die Daten im localStorage, damit sie beim Neuladen erhalten bleiben
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
    const teamCount = Object.values(encounters).filter(
      (encounter) => encounter?.inTeam
    ).length;

    if (teamCount < 6 || isInTeam) {
      setEncounters({
        ...encounters,
        [route]: { ...encounters[route], inTeam: !isInTeam },
      });
    }
  };

  const toggleBoss = (boss) => {
    setDefeatedBosses((prev) =>
      prev.includes(boss) ? prev.filter((b) => b !== boss) : [...prev, boss]
    );
  };

  const reset = () => {
    if (window.confirm("Möchtest du den Tracker wirklich zurücksetzen?")) {
      setEncounters({});
      setDefeatedBosses([]);
      localStorage.removeItem(sessionId); // Entfernt die gespeicherten Daten aus dem localStorage
    }
  };

  const save = () => {
    const savedData = JSON.stringify({ encounters, defeatedBosses });
    const blob = new Blob([savedData], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "soulsilver_tracker_data.txt";
    link.click();
  };

  const load = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result);
        setEncounters(data.encounters || {});
        setDefeatedBosses(data.defeatedBosses || []);
      };
      reader.readAsText(file);
    }
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
    <div style={styles.container}>
      <h1 style={styles.header}>Pokémon SoulSilver Tracker</h1>
      <div style={styles.buttonsContainer}>
        <button onClick={save} style={styles.saveButton}>
          💾 Save
        </button>
        <input
          type="file"
          onChange={load}
          style={styles.fileInput}
        />
        <button onClick={reset} style={styles.resetButton}>
          🔁 Reset Tracker
        </button>
      </div>

      <div style={styles.teamContainer}>
        {players.map((player) => (
          <div key={player} style={styles.teamPanel}>
            <h3>{player.toUpperCase()} – Current Team</h3>
            <div style={styles.pokemonContainer}>
              {Object.entries(encounters)
                .filter(([_, data]) => data?.inTeam)
                .map(([route, data]) => {
                  const entry = data[player];
                  return (
                    entry?.name && (
                      <div key={route} style={styles.pokemonCard}>
                        <div style={styles.cardHeader}>
                          <img
                            src={getSpriteUrl(entry.name)}
                            alt={entry.name}
                            style={styles.pokemonImage}
                          />
                        </div>
                        <div style={styles.cardBody}>
                          <div style={styles.pokemonName}>
                            {entry.nickname || entry.name}
                          </div>
                          <div style={styles.pokemonStatus}>
                            {statusIcons[entry.status]} {entry.status}
                          </div>
                        </div>
                      </div>
                    )
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {allRoutes.map((route) => (
        <div
          key={route}
          style={{
            ...styles.routePanel,
            ...(encounters[route]?.inTeam ? styles.routePanelActive : {}),
          }}
        >
          <h2 style={styles.routeHeader}>
            {route}
            <label>
              <input
                type="checkbox"
                checked={!!encounters[route]?.inTeam}
                onChange={() => toggleTeam(route)}  // toggleTeam aktualisiert den "Im Team"-Status
              />{" "}
              Team
            </label>
          </h2>

          <div style={styles.inputContainer}>
            {players.map((playerKey) => {
              const entry = encounters[route]?.[playerKey] || {};
              return (
                <div key={playerKey} style={styles.inputPanel}>
                  <input
                    list="pokemon-list"
                    value={entry.name || ""}
                    placeholder="Pokémon"
                    style={styles.inputField}
                    onChange={(e) =>
                      updateEncounter(route, playerKey, "name", e.target.value)
                    }
                  />
                  <input
                    value={entry.nickname || ""}
                    placeholder="Nickname"
                    style={styles.inputField}
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
                      ...styles.selectField,
                      background: statusColors[entry.status] || "#FFFFFF",
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
                    style={styles.pokemonImageSmall}
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
                  ...styles.bossPanel,
                  backgroundColor: defeatedBosses.includes(boss.name)
                    ? "#22C55E"
                    : "#f7faff",
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
                {boss.levelCap && (
                  <div style={{ fontSize: "12px", color: "#333333", marginTop: "8px" }}>
                    Level Cap: {boss.levelCap}
                  </div>
                )}
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
