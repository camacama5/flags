import { collection, getDocs, doc, updateDoc, increment, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const flagDisplay = document.getElementById('flag-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.querySelector('#score span');

let score = 0;
let allFlags = [];
let currentFlag = null;

// רשימת המדינות להזרקה אוטומטית (חסכון של שעות עבודה)
const initialFlags = [
    { name: "ישראל", code: "il", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "צרפת", code: "fr", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "גרמניה", code: "de", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "איטליה", code: "it", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "ספרד", code: "es", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "ארצות הברית", code: "us", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "אנגליה", code: "gb", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "יפן", code: "jp", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "ברזיל", code: "br", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "ארגנטינה", code: "ar", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "קנדה", code: "ca", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "מקסיקו", code: "mx", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "יוון", code: "gr", difficulty: 1, solve_count: 0, total_players: 1 }
];

async function loadGame() {
    try {
        const db = window.db;
        const querySnapshot = await getDocs(collection(db, "flags"));
        allFlags = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // אם בסיס הנתונים ריק או קטן מדי, נזריק את המדינות אוטומטית
        if (allFlags.length < 5) {
            console.log("ממלא בסיס נתונים...");
            for (const f of initialFlags) {
                await addDoc(collection(db, "flags"), f);
            }
            // טעינה מחדש אחרי ההזרקה
            const updatedSnapshot = await getDocs(collection(db, "flags"));
            allFlags = updatedSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        renderRound();
    } catch (error) {
        console.error("Error:", error);
        messageDisplay.innerText = "שגיאה בחיבור לנתונים";
    }
}

function renderRound() {
    answerInput.value = "";
    messageDisplay.innerText = "";
    currentFlag = allFlags[Math.floor(Math.random() * allFlags.length)];

    flagDisplay.innerHTML = `<img src="https://flagcdn.com/w320/${currentFlag.code}.png" width="200" style="border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">`;
}

async function checkAnswer() {
    const db = window.db;
    const userAnswer = answerInput.value.trim();
    const correctAnswer = currentFlag.name.trim();
    const flagRef = doc(db, "flags", currentFlag.id);

    await updateDoc(flagRef, { total_players: increment(1) });

    if (userAnswer === correctAnswer) {
        const failureRate = (currentFlag.total_players - currentFlag.solve_count) / currentFlag.total_players;
        const pointsWon = Math.round(currentFlag.difficulty * (failureRate + 1) * 10);
        
        score += pointsWon;
        scoreDisplay.innerText = score;
        
        messageDisplay.innerText = `נכון! זו ${correctAnswer}. זכית ב-${pointsWon} נקודות!`;
        messageDisplay.style.color = "green";

        await updateDoc(flagRef, { solve_count: increment(1) });
        setTimeout(renderRound, 2000);
    } else {
        messageDisplay.innerText = "טעות, נסה שוב בעברית";
        messageDisplay.style.color = "red";
    }
}

submitBtn.onclick = checkAnswer;
answerInput.onkeypress = (e) => { if(e.key === 'Enter') checkAnswer(); };

loadGame();
