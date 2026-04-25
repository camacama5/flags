import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.db;

async function uploadFlags() {
    const flags = [
        { name: "Germany", code: "de", difficulty: 1, solve_count: 0, total_players: 1 },
        { name: "Italy", code: "it", difficulty: 1, solve_count: 0, total_players: 1 },
        { name: "Spain", code: "es", difficulty: 1, solve_count: 0, total_players: 1 },
        { name: "Brazil", code: "br", difficulty: 2, solve_count: 0, total_players: 1 },
        { name: "Japan", code: "jp", difficulty: 2, solve_count: 0, total_players: 1 },
        { name: "Argentina", code: "ar", difficulty: 2, solve_count: 0, total_players: 1 },
        { name: "Canada", code: "ca", difficulty: 1, solve_count: 0, total_players: 1 }
    ];

    for (const flag of flags) {
        try {
            await addDoc(collection(db, "flags"), flag);
            console.log("הוספתי את: " + flag.name);
        } catch (e) {
            console.error("שגיאה בהוספה: ", e);
        }
    }
    alert("סיימתי להעלות את כל המדינות!");
}

uploadFlags();
