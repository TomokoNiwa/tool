/**
 * 公開スケジュール管理システム / 工数管理システム
 * @author TOMOKO NIWA & Gemini (Google AI)
 * @version 1.0.0
 * @date 2026-02-03
 */
    let taskList = [];

    window.onload = function() {
        console.log("🚀 System initialized. Collaborated with Gemini.");

        const savedData = localStorage.getItem('myTaskData');
        if (savedData) {
            taskList = JSON.parse(savedData);
            render();
        }
    };

    function saveData() {
        localStorage.setItem('myTaskData', JSON.stringify(taskList));
    }

    function createNewTask() {
        const name = document.getElementById('taskName').value;
        if (!name) return;
        taskList.push({ id: Date.now(), name: name, logs: [], workSum: 0, mtgSum: 0 });
        saveData();
        render();
        document.getElementById('taskName').value = '';
    }

    function addRecord(taskId) {
        const date = document.getElementById(`date-${taskId}`).value;
        const type = document.getElementById(`type-${taskId}`).value;
        const hours = parseFloat(document.getElementById(`hour-${taskId}`).value);

        if (!date || isNaN(hours)) return alert("入力を確認してください");

        const task = taskList.find(t => t.id === taskId);
        task.logs.push({ date, type, hours });
        task.workSum = task.logs.filter(l => l.type === '作業').reduce((s, l) => s + l.hours, 0);
        task.mtgSum = task.logs.filter(l => l.type === 'MTG').reduce((s, l) => s + l.hours, 0);

        saveData();
        render();
    }

    function deleteTask(taskId) {
        if (!confirm("このタスクを削除してよろしいですか？")) return;
        taskList = taskList.filter(t => t.id !== taskId);
        saveData();
        render();
    }

    // JSONとして書き出し
    function exportJSON() {
        const dataStr = JSON.stringify(taskList, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks_data.json';
        a.click();
    }

// JSONを読み込み
function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (Array.isArray(data)) {
                taskList = data;
                saveData();
                render();
                alert(`工数データを読み込みました。\n現在のタスク数: ${taskList.length}件`);
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            alert("インポートに失敗しました。正しいJSONファイルを選択してください。");
        }
        
        event.target.value = "";
    };
    reader.readAsText(file);
}

function render() {
        const area = document.getElementById('taskDisplayArea');
        area.innerHTML = '';
        taskList.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            
            const logHtml = task.logs.map(l => `
                <div class="log-row">
                    <span>${l.date} [${l.type}]</span>
                    <span>${l.hours.toFixed(2)}h</span>
                </div>`).join('');

            card.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.name}</div>
                    <div class="btn-wrap">
                        <button class="btn-manual" onclick="sendToSchedule('${encodeURIComponent(task.name)}')">予定登録</button>
                        <button class="btn-delete" onclick="deleteTask(${task.id})">削除</button>
                    </div>
                </div>
                <div class="task-summary">
                    <div class="summary-item sum-work">作業: ${task.workSum.toFixed(2)}h</div>
                    <div class="summary-item sum-mtg">MTG: ${task.mtgSum.toFixed(2)}h</div>
                    <div class="summary-item sum-total">合計: ${(task.workSum + task.mtgSum).toFixed(2)}h</div>
                </div>
                <div class="log-list">${logHtml || '実績なし'}</div>
                <div class="input-row">
                    <input type="date" id="date-${task.id}">
                    <select id="type-${task.id}">
                        <option value="作業">作業</option>
                        <option value="MTG">MTG</option>
                    </select>
                    <input type="number" id="hour-${task.id}" value="0.25" min="0.25" step="0.25">
                    <button class="btn-add" onclick="addRecord(${task.id})">登録</button>
                </div>`;
            area.appendChild(card);

            const dateInput = document.getElementById(`date-${task.id}`);
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        });
    }

    function sendToSchedule(taskName) {
        window.location.href = `schedule.html?name=${taskName}`;
    }