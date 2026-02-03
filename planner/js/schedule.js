/**
 * 公開スケジュール管理システム / 工数管理システム
 * @author TOMOKO NIWA & Gemini (Google AI)
 * @version 1.0.0
 * @date 2026-02-03
 */
    let releaseTasks = [];
    const STORAGE_KEY = 'releaseTaskData_final_v7';

    window.onload = function() {
        console.log("🚀 System initialized. Collaborated with Gemini.");
        
        const hourSelect = document.getElementById('pubHour');
        for (let i = 0; i < 24; i++) {
            let opt = document.createElement('option');
            let h = ('0' + i).slice(-2);
            opt.value = h;
            opt.innerHTML = h + "時";
            hourSelect.appendChild(opt);
        }
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('pubDay').value = today;
        const params = new URLSearchParams(window.location.search);
        if (params.has('name')) {
            const taskName = params.get('name');
            document.getElementById('taskName').value = decodeURIComponent(taskName);
            document.getElementById('taskName').style.backgroundColor = 'var(--color_lightBlue)';
            document.getElementById('pubDay').focus();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) loadDataFromString(saved);
    };

    function loadDataFromString(jsonString) {
        try {
            releaseTasks = JSON.parse(jsonString).map(t => ({...t, pubDate: new Date(t.pubDate)}));
            render();
            checkStatus();
        } catch (e) { console.log("初期読込エラー"); }
    }

    function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(releaseTasks)); }

function addTask() {
    const name = document.getElementById('taskName').value;
    const day = document.getElementById('pubDay').value;
    const hour = document.getElementById('pubHour').value;
    const min = document.getElementById('pubMin').value;
    const type = document.getElementById('pubType').value;
    const creator = document.getElementById('creatorName').value;
    const director = document.getElementById('directorName').value;
    const editingId = document.getElementById('editingId').value;

    if (!name || !day) return alert("タスク名と日付を入力してください");
    const pubDate = new Date(`${day}T${hour}:${min}:00`);

        if (editingId) {
            const index = releaseTasks.findIndex(t => t.id == editingId);
            if (index !== -1) {
                releaseTasks[index] = { ...releaseTasks[index], name, pubDate, type, creator, director };
            }
            document.getElementById('editingId').value = "";
            document.getElementById('submitBtn').innerText = "タスクを追加";
            document.getElementById('inputForm').style.borderTopColor = "#1a73e8";
        } else {
            releaseTasks.push({ id: Date.now() + Math.random(), name, pubDate, type, creator, director, isPublished: false });
        }

        saveData(); 
        render();
        resetForm();
    }

    function resetForm() {
        document.getElementById('taskName').value = '';
        document.getElementById('creatorName').value = '';
        document.getElementById('directorName').value = '';
    }

    function startEdit(id) {
        const task = releaseTasks.find(t => t.id == id);
        if (!task) return;

        document.getElementById('taskName').value = task.name;
        document.getElementById('pubDay').value = task.pubDate.toISOString().split('T')[0];
        document.getElementById('pubHour').value = ('0' + task.pubDate.getHours()).slice(-2);
        document.getElementById('pubMin').value = ('0' + task.pubDate.getMinutes()).slice(-2);
        document.getElementById('pubType').value = task.type;
        document.getElementById('creatorName').value = task.creator;
        document.getElementById('directorName').value = task.director;
        
        document.getElementById('editingId').value = id;
        document.getElementById('submitBtn').innerText = "修正を保存する";
        document.getElementById('inputForm').style.borderTopColor = "#e67e22";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function checkStatus() {
        const now = new Date();
        let changed = false;
        releaseTasks.forEach(task => {
            if (task.type === 'timer' && !task.isPublished && task.pubDate <= now) {
                task.isPublished = true; changed = true;
            }
        });
        if (changed) { saveData(); render(); }
    }
    setInterval(checkStatus, 10000);

    function toggleManual(id) {
        const task = releaseTasks.find(t => t.id == id);
        task.isPublished = !task.isPublished;
        saveData(); render();
    }

    function deleteTask(id) {
        if(!confirm("このタスクを削除しますか？")) return;
        releaseTasks = releaseTasks.filter(t => t.id != id);
        saveData(); render();
    }

    function sortTasks() {
        releaseTasks.sort((a, b) => a.pubDate - b.pubDate);
        render();
    }

    function exportJSON() {
        if (releaseTasks.length === 0) return alert("データがありません。");
        const dataStr = JSON.stringify(releaseTasks, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `backup_${new Date().toLocaleDateString()}.json`; a.click();
    }

    function exportCSV() {
        if (releaseTasks.length === 0) return alert("データがありません。");
        let csvContent = "タスク名,公開予定日時,方式,クリエイター,ディレクター,ステータス\n";
        releaseTasks.forEach(task => {
            const status = task.isPublished ? "公開中" : "待機中";
            const type = task.type === 'timer' ? "タイマー" : "手動";
            csvContent += `"${task.name}","${formatDate(task.pubDate)}","${type}","${task.creator}","${task.director}","${status}"\n`;
        });
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `公開スケジュール_${new Date().toLocaleDateString()}.csv`; a.click();
    }

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const incomingData = JSON.parse(e.target.result).map(t => ({
                ...t, 
                pubDate: new Date(t.pubDate)
            }));
            releaseTasks = incomingData;

            saveData(); 
            render();
            alert(`データを読み込みました（全${releaseTasks.length}件）`);
        } catch (err) { 
            alert("インポートに失敗しました。ファイル形式を確認してください。"); 
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

    function formatDate(date) {
        const y = date.getFullYear();
        const m = ('0' + (date.getMonth() + 1)).slice(-2);
        const d = ('0' + date.getDate()).slice(-2);
        const h = ('0' + date.getHours()).slice(-2);
        const min = ('0' + date.getMinutes()).slice(-2);
        return `${y}/${m}/${d} ${h}:${min}`;
    }

    function render() {
        const area = document.getElementById('taskList');
        area.innerHTML = '';
        releaseTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card ${task.isPublished ? 'status-published' : 'status-waiting'}`;
            card.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.isPublished ? '✅ ' : '⏳ '}${task.name}</div>
                    <div class="btn-wrap">
                        ${task.type === 'manual' && !task.isPublished ? 
                            `<button class="btn-manual" onclick="toggleManual(${task.id})">公開完了</button>` : ''}
                        <button class="btn-edit" onclick="startEdit(${task.id})">修正</button>
                        <button class="btn-delete" onclick="deleteTask(${task.id})">削除</button>
                    </div>
                </div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">公開予定</span><strong>${formatDate(task.pubDate)}</strong></div>
                    <div class="info-item"><span class="info-label">方式</span><strong>${task.type === 'timer' ? 'タイマー' : '手動'}</strong></div>
                    <div class="info-item"><span class="info-label">クリエイター</span><strong>${task.creator || '-'}</strong></div>
                    <div class="info-item"><span class="info-label">ディレクター</span><strong>${task.director || '-'}</strong></div>
                </div>`;
            area.appendChild(card);
        });
    }