import { collection, getDocs, doc, updateDoc, increment, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const flagDisplay = document.getElementById('flag-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.querySelector('#score span');

let score = 0;
let allFlags = [];
let currentActiveFlags = []; // 5 הדגלים שמוצגים כרגע
let solvedInRound = 0; // סופר כמה הצלחות היו בסיבוב הנוכחי

const initialFlags = [
    { name: "ישראל", code: "il", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "צרפת", code: "fr", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "גרמניה", code: "de", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "איטליה", code: "it", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "ספרד", code: "es", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "יוון", code: "gr", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "יפן", code: "jp", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "ארצות הברית", code: "us", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "ברזיל", code: "br", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "ארגנטינה", code: "ar", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "קנדה", code: "ca", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "מקסיקו", code: "mx", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "אנגליה", code: "gb", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "פורטוגל", code: "pt", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "הולנד", code: "nl", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "שווייץ", code: "ch", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "טורקיה", code: "tr", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "אוסטרליה", code: "au", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "דרום אפריקה", code: "za", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "מצרים", code: "eg", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "תאילנד", code: "th", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "דרום קוריאה", code: "kr", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "סין", code: "cn", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "רוסיה", code: "ru", difficulty: 1, solve_count: 0, total_players: 1 },
    { name: "הודו", code: "in", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "פולין", code: "pl", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "בלגיה", code: "be", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "שבדיה", code: "se", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "אירלנד", code: "ie", difficulty: 2, solve_count: 0, total_players: 1 },
    { name: "ניו זילנד", code: "nz", difficulty: 2, solve_count: 0, total_players: 1 }
];

async function loadGame() {
    try {
        const db = window.db;
        const querySnapshot = await getDocs(collection(db, "flags"));
        allFlags = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (allFlags.length < 25) {
            console.log("ממלא בסיס נתונים ל-30 מדינות...");
            for (const f of initialFlags) {
                // בדיקה פשוטה למניעת כפילויות לפני הזרקה
                if (!allFlags.some(existing => existing.code === f.code)) {
                    await addDoc(collection(db, "flags"), f);
                }
            }
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
    solvedInRound = 0;
    
    // בחירת 5 דגלים אקראיים ללא חזרות
    currentActiveFlags = [...allFlags]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map(f => ({ ...f, solved: false }));

    // יצירת תצוגה של 3 למעלה ו-2 למטה
    flagDisplay.style.display = "flex";
    flagDisplay.style.flexWrap = "wrap";
    flagDisplay.style.justifyContent = "center";
    flagDisplay.style.gap = "15px";
    flagDisplay.style.maxWidth = "600px";
    flagDisplay.style.margin = "0 auto";

    updateFlagDisplay();
}

function updateFlagDisplay() {
    flagDisplay.innerHTML = "";
    currentActiveFlags.forEach((flag, index) => {
        const container = document.createElement('div');
        container.style.position = "relative";
        container.style.width = index < 3 ? "28%" : "35%"; // סידור של 3 ו-2
        
        let html = `<img src="https://flagcdn.com/w320/${flag.code}.png" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); ${flag.solved ? 'opacity: 0.5;' : ''}">`;
        
        if (flag.solved) {
            html += `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #28a745; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">V</div>`;
        }
        
        container.innerHTML = html;
        flagDisplay.appendChild(container);
    });
}

async function checkAnswer() {
    const db = window.db;
    const userAnswer = answerInput.value.trim();
    
    // חיפוש האם התשובה מתאימה לאחד הדגלים שטרם נפתרו על המסך
    const foundIndex = currentActiveFlags.findIndex(f => f.name === userAnswer && !f.solved);

    if (foundIndex !== -1) {
        const matchedFlag = currentActiveFlags[foundIndex];
        matchedFlag.solved = true;
        solvedInRound++;
        
        const flagRef = doc(db, "flags", matchedFlag.id);
        await updateDoc(flagRef, { 
            total_players: increment(1),
            solve_count: increment(1)
        });

        // חישוב ניקוד
        const failureRate = (matchedFlag.total_players - matchedFlag.solve_count) / matchedFlag.total_players;
        const pointsWon = Math.round(matchedFlag.difficulty * (failureRate + 1) * 10);
        score += pointsWon;
        scoreDisplay.innerText = score;

        messageDisplay.innerText = "יפה מאוד!";
        messageDisplay.style.color = "green";
        answerInput.value = "";
        
        updateFlagDisplay();

        // אם ענה על 2 - עוברים שלב
        if (solvedInRound === 2) {
            messageDisplay.innerText = "כל הכבוד! עוברים לשלב הבא...";
            setTimeout(renderRound, 1500);
        }
    } else {
        messageDisplay.innerText = "טעות או שכבר ענית על דגל זה";
        messageDisplay.style.color = "red";
    }
}

submitBtn.onclick = checkAnswer;
answerInput.onkeypress = (e) => { if(e.key === 'Enter') checkAnswer(); };

loadGame();
