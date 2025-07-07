import React, { useState, useEffect } from "react";

const PASSWORD = "ziad-3mkf0";

export default function App() {
  const [teams, setTeams] = useState(() => JSON.parse(localStorage.getItem("teams")) || []);
  const [matches, setMatches] = useState(() => JSON.parse(localStorage.getItem("matches")) || []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newTeam, setNewTeam] = useState("");

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.setItem("matches", JSON.stringify(matches));
  }, [teams, matches]);

  const handleLogin = () => {
    const input = prompt("أدخل كلمة السر:");
    if (input === PASSWORD) setIsAdmin(true);
    else alert("كلمة السر غير صحيحة");
  };

  const addTeam = () => {
    if (!newTeam.trim()) return;
    setTeams([...teams, { name: newTeam.trim(), points: 0, played: 0, win: 0, draw: 0, lose: 0 }]);
    setNewTeam("");
  };

  const deleteTeam = (index) => {
    if (!window.confirm("هل أنت متأكد من حذف الفريق؟")) return;
    const updatedTeams = [...teams];
    updatedTeams.splice(index, 1);
    setTeams(updatedTeams);
    setMatches([]); // يجب إعادة القرعة
  };

  const generateMatches = () => {
    if (teams.length < 2) return alert("أضف فريقين على الأقل");
    let generated = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        generated.push({ teamA: teams[i].name, teamB: teams[j].name, scoreA: "", scoreB: "" });
      }
    }
    setMatches(generated);
  };

  const updateScore = (index, value, team) => {
    const updatedMatches = [...matches];
    if (team === "A") {
      updatedMatches[index].scoreA = value;
    } else {
      updatedMatches[index].scoreB = value;
    }
    setMatches(updatedMatches);
    updatePoints(updatedMatches);
  };

  const updatePoints = (allMatches) => {
    const stats = {};
    teams.forEach((t) => {
      stats[t.name] = { name: t.name, points: 0, played: 0, win: 0, draw: 0, lose: 0 };
    });

    allMatches.forEach((m) => {
      const { teamA, teamB, scoreA, scoreB } = m;
      if (scoreA === "" || scoreB === "") return;

      const a = parseInt(scoreA), b = parseInt(scoreB);
      stats[teamA].played++;
      stats[teamB].played++;

      if (a > b) {
        stats[teamA].win++;
        stats[teamA].points += 3;
        stats[teamB].lose++;
      } else if (a < b) {
        stats[teamB].win++;
        stats[teamB].points += 3;
        stats[teamA].lose++;
      } else {
        stats[teamA].draw++;
        stats[teamB].draw++;
        stats[teamA].points += 1;
        stats[teamB].points += 1;
      }
    });

    const updated = teams.map((t) => ({
      ...stats[t.name],
    }));
    setTeams(updated);
  };

  const resetAll = () => {
    if (!window.confirm("هل تريد مسح كل البيانات؟")) return;
    setTeams([]);
    setMatches([]);
    setIsAdmin(false);
    localStorage.clear();
  };

  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  return (
    <div style={{ padding: 20, fontFamily: "Arial", backgroundColor: "#f0f0f0", color: "#000" }}>
      <h1 style={{ textAlign: "center" }}>🏆 دوري الأصدقاء</h1>

      {!isAdmin && (
        <button onClick={handleLogin} style={{ marginBottom: 10 }}>
          الدخول كمدير
        </button>
      )}

      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <h2>إدارة الفرق</h2>
          <input
            placeholder="اسم الفريق"
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
          />
          <button onClick={addTeam}>➕ إضافة</button>
          <button onClick={generateMatches}>🎲 توليد القرعة</button>
          <button onClick={resetAll} style={{ backgroundColor: "#f88", marginRight: 10 }}>
            🗑️ مسح الكل
          </button>
          <ul>
            {teams.map((t, i) => (
              <li key={i}>
                {t.name}{" "}
                <button onClick={() => deleteTeam(i)} style={{ color: "red" }}>
                  حذف
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2>📋 جدول الترتيب</h2>
      <table border="1" cellPadding="5" style={{ width: "100%", backgroundColor: "#fff" }}>
        <thead>
          <tr>
            <th>الفريق</th>
            <th>لعب</th>
            <th>فوز</th>
            <th>تعادل</th>
            <th>خسارة</th>
            <th>نقاط</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((t, i) => (
            <tr key={i}>
              <td>{t.name}</td>
              <td>{t.played}</td>
              <td>{t.win}</td>
              <td>{t.draw}</td>
              <td>{t.lose}</td>
              <td>{t.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 30 }}>📅 جدول المباريات</h2>
      {matches.length === 0 ? (
        <p>لم يتم توليد جدول المباريات بعد.</p>
      ) : (
        <ul>
          {matches.map((m, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {m.teamA} (
              {isAdmin ? (
                <input
                  type="number"
                  value={m.scoreA}
                  onChange={(e) => updateScore(i, e.target.value, "A")}
                  style={{ width: 40 }}
                />
              ) : (
                m.scoreA || "-"
              )}
              ) - (
              {isAdmin ? (
                <input
                  type="number"
                  value={m.scoreB}
                  onChange={(e) => updateScore(i, e.target.value, "B")}
                  style={{ width: 40 }}
                />
              ) : (
                m.scoreB || "-"
              )}
              ) {m.teamB}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
