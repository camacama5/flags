import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// חיבור לבסיס הנתונים שהגדרנו ב-HTML
const db = window.db;

// חיבור לאלמנטים במסך
const flagDisplay = document.getElementById('flag-display');
const optionsContainer = document.getElementById('options-container');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.querySelector('#score span');

let score = 0;
let allFlags = [];

// 1. פונקציה למשיכת המדינות מה-Firebase
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
        console.error("Error: ", e);
        messageDisplay.innerText = "שגיאה בחיבור לנתונים";
    }
}

// 2. פונקציה להצגת סיבוב (דגל וכפתורים)
function renderRound() {
    optionsContainer.innerHTML = "";
    messageDisplay.innerText = "";

    // בוחרים דגל אקראי ממה שיש ב-Database
    const randomIndex = Math.floor(Math.random() * allFlags.length);
    const currentFlag = allFlags[randomIndex];

    // מציגים את שם המדינה כרגע (עד שנעלה תמונות אמיתיות)
    flagDisplay.innerText = "דגל של: " + currentFlag.name;

    // יוצרים כפתור לכל מדינה שיש לנו במאגר
    allFlags.forEach(flag => {
        const button = document.createElement('button');
        button.innerText = flag.name;
        button.onclick = () => checkAnswer(flag.name, currentFlag.name);
        optionsContainer.appendChild(button);
    });
}

// 3. בדיקת התשובה ועדכון ניקוד
function checkAnswer(selected, correct) {
    if (selected === correct) {
        score += 10;
        scoreDisplay.innerText = score;
        messageDisplay.innerText = "נכון! כל הכבוד!";
        messageDisplay.style.color = "green";
        
        // מחכים שנייה ועוברים לדגל הבא
        setTimeout(renderRound, 1000);
    } else {
        messageDisplay.innerText = "טעות, נסה שוב!";
        messageDisplay.style.color = "red";
    }
}

// הפעלת המשחק
loadGame();
