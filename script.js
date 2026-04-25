import { collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const flagDisplay = document.getElementById('flag-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.querySelector('#score span');

let score = 0;
let allFlags = [];
let currentFlag = null;

async function loadGame() {
    try {
        const db = window.db;
        const querySnapshot = await getDocs(collection(db, "flags"));
        allFlags = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (allFlags.length > 0) {
            renderRound();
        }
    } catch (error) {
        console.error("Error loading flags:", error);
        messageDisplay.innerText = "שגיאה בחיבור לנתונים";
    }
}

function renderRound() {
    answerInput.value = "";
    messageDisplay.innerText = "";
    currentFlag = allFlags[Math.floor(Math.random() * allFlags.length)];

    flagDisplay.innerHTML = `<img src="https://flagcdn.com/w320/${currentFlag.code}.png" width="200" style="border: 1px solid #ccc; border-radius: 8px;">`;
}

async function checkAnswer() {
    const db = window.db;
    // ניקוי רווחים מהתשובה של המשתמש
    const userAnswer = answerInput.value.trim();
    const correctAnswer = currentFlag.name.trim();
    const flagRef = doc(db, "flags", currentFlag.id);

    // עדכון "סך שחקנים" ב-Firebase
    await updateDoc(flagRef, { total_players: increment(1) });

    if (userAnswer === correctAnswer) {
        // חישוב ניקוד דינמי לפי האפיון
        const failureRate = (currentFlag.total_players - currentFlag.solve_count) / currentFlag.total_players;
        const pointsWon = Math.round(currentFlag.difficulty * (failureRate + 1) * 10);
        
        score += pointsWon;
        scoreDisplay.innerText = score;
        
        messageDisplay.innerText = `נכון! זו ${correctAnswer}. זכית ב-${pointsWon} נקודות!`;
        messageDisplay.style.color = "green";

        // עדכון הצלחה ב-Firebase
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
