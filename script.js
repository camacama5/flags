import { collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.db;
const flagDisplay = document.getElementById('flag-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.querySelector('#score span');

let score = 0;
let allFlags = [];
let currentFlag = null;

async function loadGame() {
    const querySnapshot = await getDocs(collection(db, "flags"));
    allFlags = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderRound();
}

function renderRound() {
    answerInput.value = "";
    messageDisplay.innerText = "";
    currentFlag = allFlags[Math.floor(Math.random() * allFlags.length)];

    flagDisplay.innerHTML = `<img src="https://flagcdn.com/w320/${currentFlag.code}.png" width="200">`;
}

async function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = currentFlag.name.toLowerCase();
    const flagRef = doc(db, "flags", currentFlag.id);

    // עדכון "סך שחקנים" ב-Firebase בכל מקרה
    await updateDoc(flagRef, { total_players: increment(1) });

    if (userAnswer === correctAnswer) {
        // חישוב ניקוד דינמי: קושי * (טועים / סך הכל)
        const failureRate = (currentFlag.total_players - currentFlag.solve_count) / currentFlag.total_players;
        const pointsWon = Math.round(currentFlag.difficulty * (failureRate + 1) * 10);
        
        score += pointsWon;
        scoreDisplay.innerText = score;
        
        messageDisplay.innerText = `נכון! זכית ב-${pointsWon} נקודות!`;
        messageDisplay.style.color = "green";

        // עדכון הצלחה ב-Firebase
        await updateDoc(flagRef, { solve_count: increment(1) });
        
        setTimeout(renderRound, 2000);
    } else {
        messageDisplay.innerText = "טעות, נסה שוב";
        messageDisplay.style.color = "red";
    }
}

submitBtn.onclick = checkAnswer;
answerInput.onkeypress = (e) => { if(e.key === 'Enter') checkAnswer(); };

loadGame();
