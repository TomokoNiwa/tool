/**
 * common.js - カレンダー・メニュー・チェックリスト
 */
(function() {
    // 1. 初期化（メニュー）
    const init = function() {
        const hb = document.querySelector('.hamburger') || document.getElementById('js-hamburger');
        const nav = document.getElementById('js-nav') || document.querySelector('.nav');

        if (hb && nav) {
            hb.onclick = null;
            hb.addEventListener('click', function(e) {
                e.preventDefault();
                hb.classList.toggle('is-active');
                nav.classList.toggle('is-active');
            });
        }
    }; 

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 2. カレンダー切り替え
    window.switchCalendar = function(mode) {
        const wv = document.getElementById('view-week');
        const mv = document.getElementById('view-month');
        const btnW = document.getElementById('btn-week');
        const btnM = document.getElementById('btn-month');

        if (!wv || !mv) return;

        if (mode === 'week') {
            wv.style.display = 'block';
            mv.style.display = 'none';
            if (btnW) btnW.classList.add('active');
            if (btnM) btnM.classList.remove('active');
        } else {
            wv.style.display = 'none';
            mv.style.display = 'block';
            if (btnW) btnW.classList.remove('active');
            if (btnM) btnM.classList.add('active');

            if (typeof window.createMonth === 'function') {
                window.createMonth();
            } else if (typeof window.renderCalendar === 'function') {
                window.renderCalendar();
            }
        }
    };

    // 3. モーダル・ダイアログ操作
    window.closeModal = function() {
        const m = document.getElementById('modal');
        if (m) m.style.display = 'none';
    };

    window.smileMaru = function() {
        const maru = document.getElementById('maru-img');
        if (maru) {
            maru.src = '../img/open.png'; 
            setTimeout(() => { 
                maru.src = '../img/close.png'; 
            }, 2000);
        }
    };

    // 4. チェックリスト
    const checks = document.querySelectorAll('.check-item');
    const messageArea = document.getElementById('message-area');
    const messageAreaBottom = document.getElementById('message-area-bottom');
    const resetArea = document.getElementById('reset-area');

    function updateUI() {
        if (!resetArea || !messageArea || !messageAreaBottom) return; 

        const allChecks = Array.from(checks);
        const requiredChecks = allChecks.filter(item => item.dataset.required === 'true');
        const totalItems = allChecks.length;
        const doneItems = allChecks.filter(item => item.checked).length;
        const remainingTotal = totalItems - doneItems;
        const requiredDone = requiredChecks.every(item => item.checked);
        const optionalChecks = allChecks.filter(item => item.dataset.required === 'false');
        const optionalDone = optionalChecks.every(item => item.checked);

        let msg = "";

        if (requiredDone && optionalDone) {
            msg = `<div class="perfection"><p>✨ 準備万端！</p><p>運転手さんが来るのを待つだけだね。</p></div>`;
            resetArea.style.display = "block";
        } else if (requiredDone) {
            msg = `<div class="completion"><p>🌟 準備OK！</p><p>お迎えまでカバンあけないでね。</p></div>`;
            resetArea.style.display = "block";
        } else {
            if (doneItems > 0) {
                msg = `<div class="confirmation"><p>あと <strong>${remainingTotal}個</strong> だよ。</p><p>ゆっくり確認していこう。</p></div>`;
            } else {
                msg = `<div class="confirmation"><p>持ち物チェックは <strong>${totalItems}個</strong> だよ。</p><p>用意ができたら、「OK」ボタンを押してね。</p></div>`;
            }
            resetArea.style.display = "none";
        }
        messageArea.innerHTML = messageAreaBottom.innerHTML = msg;
    }

    checks.forEach(check => {
        check.addEventListener('change', updateUI);
    });

    window.resetCheck = function() {
        checks.forEach(item => item.checked = false);
        localStorage.removeItem('preparation_done');
        updateUI();
    };

    window.onload = () => {
        updateUI();
    };  
// 5. 感情ボタンのメッセージ表示
    window.showMessage = function(text) {
        const modal = document.getElementById('modal');
        const modalText = document.getElementById('modal-text');
        const emergencyBtn = document.getElementById('emergency-btn');

        if (modal && modalText) {
            modalText.innerText = text;
            
            // 重要：電話ボタンの「親要素（pタグ）」ごと隠しちゃう！
            if (emergencyBtn) {
                emergencyBtn.closest('p').style.display = 'none';
            }
            
            modal.style.display = 'block';
        }
    };

    // 6. 「どうしよう」ボタン（緊急モーダル）
    window.showEmergencyModal = function() {
        const modal = document.getElementById('modal');
        const modalText = document.getElementById('modal-text');
        const emergencyBtn = document.getElementById('emergency-btn');

        if (modal && modalText) {
            modalText.innerText = '大丈夫。落ち着いて。\n話してみてね。';
            
            // 重要：電話ボタンの「親要素（pタグ）」を表示する！
            if (emergencyBtn) {
                emergencyBtn.closest('p').style.display = 'block';
                emergencyBtn.style.display = 'inline-block';
            }
            
            modal.style.display = 'block';
        }
    };
})();