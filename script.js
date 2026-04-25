import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// חיבור לבסיס הנתונים (מגיע מהקובץ index.html)
const db = window.db;

// חיבור לאלמנטים במסך
const flagDisplay = document.getElementById('flag-display');
const optionsContainer = document.getElementById('options-container');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.querySelector('#score span');

let score = 0;
let allFlags = [];

// פונקציה ראשונה: משיכת המדינות מה-Database
async function loadGame() {
    try {
        const querySnapshot = await getDocs(collection(db, "flags"));
        allFlags = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        if (allFlags.length > 0) {
            renderRound();
        } else {
            flagDisplay.innerHTML = "צריך להוסיף מדינות ב-Firebase!";
        }
    } catch (e) {
        console.error("שגיאה בטעינת נתונים: ", e);
        messageDisplay.innerText = "שגיאה בחיבור לנתונים";
    }
}

// פונקציה שנייה: הצגת דגל ותשובות
function renderRound() {
    optionsContainer.innerHTML = "";
    messageDisplay.innerText = "";

    // בחירת מדינה אקראית
    const randomIndex = Math.floor(Math.random() * allFlags.length);
    const currentFlag = allFlags[randomIndex];

    // כאן הקסם קורה: הפיכת ה-code (כמו il) לתמונה של דגל
    flagDisplay.innerHTML = `
        <img src="https://flagcdn.com/w320/${currentFlag.code}.png" 
             style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
    `;

    // יצירת כפתור לכל מדינה שיש לנו
    allFlags.forEach(flag => {
        const button = document.createElement('button');
        button.innerText = flag.name;
        button.onclick = () => checkAnswer(flag.name, currentFlag.name);
        optionsContainer.appendChild(button);
    });
}

// פונקציה שלישית: בדיקת התשובה
function checkAnswer(selected, correct) {
    if (selected === correct) {
        score += 10;
        scoreDisplay.innerText = score;
        messageDisplay.innerText = "נכון! כל הכבוד! 🎯";
        messageDisplay.style.color = "green";
        setTimeout(renderRound, 1000);
    } else {
        messageDisplay.innerText = "טעות, נסה שוב! ❌";
        messageDisplay.style.color = "red";
    }
}

// הפעלת המשחק בפעם הראשונה
loadGame();
