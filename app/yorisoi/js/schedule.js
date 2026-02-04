/**
 * schedule.js - 日付・予定・カレンダー・時計 専門ファイル
 */
document.addEventListener('DOMContentLoaded', function() {
    let scheduleData = {};

    // 1. データの読み込み
    async function loadScheduleData() {
        try {
            let path = 'schedule_data.json';
            if (window.location.pathname.includes('/category/')) {
                path = '../schedule_data.json';
            }

            const response = await fetch(path + '?t=' + new Date().getTime());
            
            if (response.ok) {
                scheduleData = await response.json();
                console.log("読み込まれたデータ:", scheduleData);
            } else {
                const backupResponse = await fetch('/app/yorisoi/schedule_data.json');
                if (backupResponse.ok) {
                    scheduleData = await backupResponse.json();
                }
            }
        } catch (error) {
            console.error("予定データの読み込み失敗:", error);
        } finally {
            updateAll();
        }
    }

    function updateAll() {
        updateDisplays();
        if (document.getElementById('week-table')) createWeek();
        if (document.getElementById('month-table')) createMonth();
        updateTodayEventMessage();
    }

    // --- 各種判定ロジック ---
    function getDayInfo(y, m, d) {
        const target = new Date(y, m, d);
        const today = new Date();
        today.setHours(0,0,0,0);
        return { 
            isPast: target < today, 
            isToday: target.getTime() === today.getTime() 
        };
    }

    function updateDisplays() {
        const now = new Date();
        const y = now.getFullYear(); const m = now.getMonth() + 1; const d = now.getDate();
        const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
        const dayName = dayNames[now.getDay()];

        const topDisp = document.querySelector('.js-date-top');
        if (topDisp) topDisp.innerHTML = `${y}年<span class='big-num'>${m}</span>月<span class='big-num'>${d}</span>日(${dayName})`;

        const schDisp = document.getElementById('today-info');
        if (schDisp) schDisp.innerHTML = `今日は<span class="big-num">${m}</span>月<span class="big-num">${d}</span>日(<span class="big-num">${dayName}</span>曜日)`;
        
        const ageInfo = document.getElementById('age-info');
        if (ageInfo) {
            // 1. 年齢の計算
            let age = y - 1946;
            if (m < 7 || (m === 7 && d < 4)) age--;
            
            // 2. 誕生日（今年の7月4日）を設定
            let nextBirthday = new Date(y, 6, 4); // 月は0から始まるので7月は「6」
            
            // 3. もし今年の誕生日が過ぎていたら、来年の7月4日に設定
            if (now > nextBirthday) {
                nextBirthday.setFullYear(y + 1);
            }
            
            // 4. あと何日かを計算 (ミリ秒の差を日にちに変換)
            const diffTime = nextBirthday - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 5. 表示を更新
            let birthdayMsg = "";
            if (m === 7 && d === 4) {
                birthdayMsg = "<br><span class='big-num'>今日はお誕生日だね！おめでとう！</span>";
            } else {
                birthdayMsg = `<br>誕生日まであと <span class='big-num'>${diffDays}</span> 日`;
            }

            ageInfo.innerHTML = "今、お母さんは<span class='big-num'>" + age + "</span>歳だよ" + birthdayMsg;
        }
    }

// 2026年の祝日リスト（管理画面で登録しなくても自動で赤くなるようにします）
    const holidays2026 = [
        "2026-01-01", "2026-01-12", "2026-02-11", "2026-02-23", "2026-03-20",
        "2026-04-29", "2026-05-03", "2026-05-04", "2026-05-05", "2026-05-06",
        "2026-07-20", "2026-08-11", "2026-09-21", "2026-09-22", "2026-09-23",
        "2026-10-12", "2026-11-03", "2026-11-23"
    ];

    function createDateCell(y, m, d) {
        const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const info = getDayInfo(y, m, d);
        const text = scheduleData[dateKey] || "";
        
        let classes = [];
        const dayOfWeek = new Date(y, m, d).getDay(); // 0:日, 6:土

        // --- 祝日判定 ---
        // 1. 日曜日か？ 
        // 2. もしくは祝日リスト(holidays2026)に含まれているか？
        const isHoliday = dayOfWeek === 0 || holidays2026.includes(dateKey);

        if (isHoliday) {
            classes.push("color-sun");
        } 
        else if (dayOfWeek === 6) {
            classes.push("color-sat");
        }

        // 今日と過去を後から追加（色の上書き優先度のため）
        if (info.isPast) classes.push("past-day");
        if (info.isToday) classes.push("today-bg");
        
        let content = d;
        if (text) {
            // 管理画面の「内容」に合わせた判定
            let dot = text.includes("だんらん") ? "dot-danran" : 
                      text.includes("病院") ? "dot-hospital" : 
                      text.includes("智子") ? "dot-tomoko" : 
                      text.includes("デイマネ") ? "dot-manager" : "";
            
            if (dot) {
                content = `<span class="schedule-dot ${dot}">${d}</span>`;
            }
        }

        const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : "";
        return `<td${classAttr}>${content}</td>`;
    }

    function createWeek() {
        const table = document.getElementById('week-table'); if (!table) return;
        const now = new Date(); const sun = new Date(now); sun.setDate(now.getDate() - now.getDay());
        let html = "<tr><th class='color-sun'>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class='color-sat'>土</th></tr><tr>";
        for (let i = 0; i < 7; i++) {
            const t = new Date(sun); t.setDate(sun.getDate() + i);
            html += createDateCell(t.getFullYear(), t.getMonth(), t.getDate());
        }
        table.innerHTML = html + "</tr>";
    }

    function createMonth() {
        const table = document.getElementById('month-table'); if (!table) return;
        const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
        const firstDay = new Date(y, m, 1).getDay(); const lastDate = new Date(y, m + 1, 0).getDate();
        let html = "<tr><th class='color-sun'>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class='color-sat'>土</th></tr><tr>";
        for (let i = 0; i < firstDay; i++) html += "<td></td>";
        for (let d = 1; d <= lastDate; d++) {
            if ((firstDay + d - 1) % 7 === 0 && d !== 1) html += "</tr><tr>";
            html += createDateCell(y, m, d);
        }
        table.innerHTML = html + "</tr>";
    }

    function updateTodayEventMessage() {
        const area = document.getElementById('today-event');
        if (!area) return;

        const now = new Date();
        const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        const todayKey = formatDate(now);
        const tom = new Date(); tom.setDate(now.getDate() + 1);
        const tomKey = formatDate(tom);

        const getCleanVal = (key) => {
            let val = scheduleData[key] || "";
            if (!val) return "";
            return val.replace(/^(今日|明日)[はも、]\s*/, "").replace(/だよ$/, "").trim();
        };

        const todayClean = getCleanVal(todayKey);
        const tomClean = getCleanVal(tomKey);

        const createMsg = (cleanVal, prefix) => {
            if (!cleanVal) return "";
            let suffix = cleanVal.endsWith("くる") ? "よ" : "だよ";
            let sep = (prefix === "明日" && todayClean !== "" && cleanVal === todayClean) ? "も" : "は";
            return `<p>${prefix}${sep} ${cleanVal}${suffix}</p>`;
        };

        let html = createMsg(todayClean, "今日") + createMsg(tomClean, "明日");

        if (html.trim() !== "") {
            area.innerHTML = html;
            area.style.display = "block";
        } else {
            area.style.display = "none";
        }
    }

    loadScheduleData();

// --- ここから書き換え ---
    let lastCheckedDay = new Date().getDate(); // 実行時の「日」を覚えておく

    setInterval(() => {
        const n = new Date();
        
        // 1. 時計の更新（1秒ごと）
        const el = document.getElementById('current-time');
        if (el) {
            const h = n.getHours();
            el.textContent = (h < 12 ? "午前" : "午後") + " " + (h % 12 || 12) + "時" + String(n.getMinutes()).padStart(2, '0') + "分";
        }

        // 2. 日付の更新チェック（日付が変わった瞬間だけ実行）
        if (n.getDate() !== lastCheckedDay) {
            lastCheckedDay = n.getDate(); // 新しい「日」を保存
            console.log("日付が変わったので再描画します");
            updateAll(); // これを呼ぶだけで日付表示、カレンダー、年齢、予定が全部更新されます
        }
    }, 1000);

});

    window.createMonth = function() {
        const event = new CustomEvent('renderMonth');
        document.dispatchEvent(event);
    };