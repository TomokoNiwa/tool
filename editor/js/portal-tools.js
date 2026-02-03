/**
 * 記事制作ポータル 統合スクリプト
 * @author Tomoko Niwa & Gemini
 * @version 1.0.0
 * @date 2026-02-03
 */

let currentMode = 'single';

window.onload = function() {
    console.log("🚀 System initialized. Collaborated with Gemini.");

    if (document.getElementById('singleBody')) {
        initForms();
    }
};

/**
 * 共通：コピー機能
 */
async function copyResult() {
    const outputElement = document.getElementById('outputCode') || document.getElementById('outputTags');
    const text = outputElement?.innerText;
    
    if (!text) return;
    await navigator.clipboard.writeText(text);
    alert("HTMLをコピーしました！");
}

function update() {
    // ------------------------------------------
    // A. エディター画面の処理
    // ------------------------------------------
    if (document.getElementById('leadText')) {
        const lead = document.getElementById('leadText').value.trim();
        const h4 = document.getElementById('h4Text').value.trim();
        const body = document.getElementById('bodyText').value;
        const h3 = document.getElementById('h3Text').value.trim();
        
        let htmlLines = [];
        if (lead) htmlLines.push(`<p><strong>${lead}</strong></p>`);
        if (h4) htmlLines.push(`<h4 class="heading-primary">${h4}</h4>`);
        
        if (body) {
            body.split(/\r?\n/).forEach(line => {
                let trimmedLine = line.trim();
                if (trimmedLine === "") return;
                
                let processedLine = line;

                // 【自動インデント処理】
                if (processedLine.startsWith('「')) {
                    // カギ括弧で始まる場合はそのまま
                    processedLine = processedLine;
                } else if (processedLine.startsWith('　')) {
                    // すでに全角スペースがある場合は &emsp; に置換
                    processedLine = processedLine.replace(/^　/, '&emsp;');
                } else {
                    // それ以外（文字から始まる）場合は先頭に &emsp; を付与
                    processedLine = '&emsp;' + processedLine;
                }

                htmlLines.push(`<p>${processedLine}</p>`);
            });
        }
        
        if (h3) htmlLines.push(`<h3 class="heading-primary">${h3}</h3>`);
        
        document.getElementById('outputCode').innerText = htmlLines.join('\n\n');
    }
    
    // ------------------------------------------
    // B. 画像タグ生成画面の処理
    // ------------------------------------------
    if (document.getElementById('outputTags')) {
        const output = document.getElementById('outputTags');
        const countBadge = document.getElementById('count');
        let htmls = [];

        if (currentMode === 'single') {
            const ids = document.getElementsByClassName('s-id');
            const caps = document.getElementsByClassName('s-cap');
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i].value.replace(/[{}-]/g, "").trim();
                if (id) {
                    htmls.push(`<div class="image-col space-mb-60">\n  <figure>\n    <img src="-/media/${id}.ashx" alt="">\n    <figcaption>${caps[i].value.trim()}</figcaption>\n  </figure>\n</div>`);
                }
            }
        } else {
            const id1s = document.getElementsByClassName('d-id1');
            const id2s = document.getElementsByClassName('d-id2');
            const caps = document.getElementsByClassName('d-cap');
            for (let i = 0; i < id1s.length; i++) {
                const i1 = id1s[i].value.replace(/[{}-]/g, "").trim();
                const i2 = id2s[i].value.replace(/[{}-]/g, "").trim();
                if (i1 || i2) {
                    htmls.push(`<div class="image-col space-mb-60">\n  <figure>\n    <img src="-/media/${i1}.ashx" alt="">\n  </figure>\n  <figure>\n    <img src="-/media/${i2}.ashx" alt="">\n    <figcaption>${caps[i].value.trim()}</figcaption>\n  </figure>\n</div>`);
                }
            }
        }
        output.innerText = htmls.join('\n\n');
        if (countBadge) countBadge.innerText = htmls.length + ' 件';
    }
}

/**
 * 画像タグ生成用の初期化
 */
function initForms() {
    const sBody = document.getElementById('singleBody');
    if (sBody) {
        for (let i = 1; i <= 50; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i}</td>
                <td><input type="text" class="s-id" oninput="update()"></td>
                <td><input type="text" class="s-cap" oninput="update()"></td>`;
            sBody.appendChild(tr);
        }
    }
    const dBody = document.getElementById('doubleBody');
    if (dBody) {
        for (let i = 1; i <= 10; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i}</td>
                <td><input type="text" class="d-id1" oninput="update()"></td>
                <td><input type="text" class="d-id2" oninput="update()"></td>
                <td><input type="text" class="d-cap" oninput="update()"></td>`;
            dBody.appendChild(tr);
        }
    }
}

/**
 * 画像タグ生成用のタブ切り替え
 */
function switchTab(mode) {
    currentMode = mode;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-content').forEach(f => f.classList.remove('active'));
    
    // クリックされたタブをアクティブにする（関数呼び出しから特定）
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('onclick')?.includes(mode)) {
            tab.classList.add('active');
        }
    });
    
    document.getElementById(`${mode}-form`).classList.add('active');
    update();
}