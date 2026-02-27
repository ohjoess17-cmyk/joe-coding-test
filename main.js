const lottoRowsContainer = document.querySelector('.lotto-rows-container');
const generateBtn = document.getElementById('generate-btn');
const welcomeMessage = document.getElementById('welcome-message');
const resultArea = document.getElementById('result-area');
const userIdInput = document.getElementById('user-id');
const loginBtn = document.getElementById('login-btn');
const userStatus = document.getElementById('user-status');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const historyList = document.getElementById('history-list');

// My Page Elements
const profileId = document.getElementById('profile-id');
const profileStat = document.getElementById('profile-stat');

// Game Elements
const mainTargetBallsContainer = document.getElementById('main-target-balls');
const bonusTargetBallContainer = document.getElementById('bonus-target-ball');
const currentDrawBallsContainer = document.getElementById('current-draw-balls');
const drawCountDisplay = document.getElementById('draw-count');
const gameStatusMsg = document.getElementById('game-status');
const drawOnceBtn = document.getElementById('draw-once-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const recentWinsList = document.getElementById('recent-wins-list');
const toastContainer = document.getElementById('toast-container');

// Win Popup & Effect Elements
const winPopup = document.getElementById('win-popup');
const winPopupClose = document.querySelector('.win-popup-close');
const winPopupCloseBtn = document.getElementById('win-popup-close-btn');
const fireworksContainer = document.querySelector('.fireworks');
const dramaticOverlay = document.getElementById('dramatic-overlay');

let currentUser = null;
let isFirstGeneration = true;
let currentDrawCount = 0;
let hasWon = false;

const targetNumbers = [7, 8, 13, 22, 24, 37];
const bonusNumber = 29;
const frequentNumbers = [43, 34, 12, 27, 17, 13, 19, 6, 33, 15, 7, 30, 3];
const weightedPool = [];

for (let i = 1; i <= 45; i++) {
    weightedPool.push(i);
    if (frequentNumbers.includes(i)) {
        weightedPool.push(i); 
        weightedPool.push(i);
    }
}

// --- Initialization ---
function init() {
    renderTargetBalls();
    updateLeaderboardUI();
}

function renderTargetBalls() {
    mainTargetBallsContainer.innerHTML = targetNumbers.map(n => 
        `<div class="mini-ball" style="background:${getBallColor(n)}">${n}</div>`
    ).join('');
    bonusTargetBallContainer.innerHTML = `<div class="mini-ball" style="background:${getBallColor(bonusNumber)}">${bonusNumber}</div>`;
}

// --- User & Tab Logic ---
function handleLogin() {
    const id = userIdInput.value.trim();
    if (!id) { alert("ID를 입력해주세요."); return; }
    currentUser = id;
    userStatus.textContent = `반갑습니다, ${id}님!`;
    userStatus.style.color = "var(--accent-blue)";
    generateBtn.disabled = false;
    
    loadUserGameProgress();
    
    userIdInput.disabled = true;
    loginBtn.textContent = "로그아웃";
    loginBtn.onclick = handleLogout;
    
    profileId.textContent = `${id} 님`;
    
    updateHistoryUI();
    updateStatsUI();
    updateLeaderboardUI();
    updateRecentWinsUI();
}

function handleLogout() {
    if (confirm("로그아웃 하시겠습니까?")) {
        location.reload(); 
    }
}

loginBtn.onclick = handleLogin;

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${target}-tab`).classList.add('active');
        if (target === 'mypage') updateHistoryUI();
        if (target === 'stats') updateStatsUI();
        if (target === 'game') { updateLeaderboardUI(); updateRecentWinsUI(); }
    });
});

// --- Game Logic ---

function checkWin(drawnNumbers) {
    const targetSet = new Set(targetNumbers);
    const drawnSet = new Set(drawnNumbers);
    let matchCount = 0;
    drawnSet.forEach(num => {
        if (targetSet.has(num)) matchCount++;
    });

    if (matchCount === 6) return 1; // 1등
    if (matchCount === 5 && drawnSet.has(bonusNumber)) return 2; // 2등
    if (matchCount === 5) return 3; // 3등
    if (matchCount === 4) return 4; // 4등
    if (matchCount === 3) return 5; // 5등
    return 0; // 꽝
}

function performManualDraw() {
    if (!currentUser) { alert("로그인 후 이용 가능합니다."); return; }
    if (hasWon) return;

    currentDrawCount++;
    drawCountDisplay.textContent = currentDrawCount.toLocaleString();

    const currentSet = new Set();
    while (currentSet.size < 6) {
        currentSet.add(Math.floor(Math.random() * 45) + 1);
    }
    const sortedSet = Array.from(currentSet).sort((a, b) => a - b);

    currentDrawBallsContainer.innerHTML = sortedSet.map(n => 
        `<div class="lotto-ball ball-sm" style="background:${getBallColor(n)}">${n}</div>`
    ).join('');
    currentDrawBallsContainer.style.border = "none";
    currentDrawBallsContainer.style.boxShadow = "none";

    const rank = checkWin(sortedSet);

    if (rank === 1) {
        hasWon = true;
        drawOnceBtn.disabled = true;
        saveGameProgress('won');
        
        currentDrawBallsContainer.style.border = "2px solid var(--accent-green)";
        currentDrawBallsContainer.style.boxShadow = "0 0 20px var(--accent-green)";
        gameStatusMsg.textContent = `... 두근 ... 두근 ...`;
        gameStatusMsg.style.color = "var(--accent-orange)";

        document.body.classList.add('pre-win-effect');
        dramaticOverlay.classList.remove('hidden');
        
        setTimeout(() => {
            gameStatusMsg.textContent = `🎉 축하합니다! ${currentDrawCount.toLocaleString()}번 만에 1등 당첨!`;
            gameStatusMsg.style.color = "var(--accent-green)";
            showWinPopup();
        }, 1500);

    } else if (rank >= 2 && rank <= 5) {
        saveRecentWin(rank, currentDrawCount);
        updateRecentWinsUI();
        showWinToast(rank, currentDrawCount);
        saveGameProgress('ongoing');
    } else {
        saveGameProgress('ongoing');
    }
}

function showWinPopup() {
    dramaticOverlay.classList.add('hidden');
    winPopup.classList.remove('hidden');
    winPopup.classList.add('visible');
    fireworksContainer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const firework = document.createElement('div');
        firework.classList.add('firework');
        firework.style.top = `${Math.random() * 100}%`;
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.animationDelay = `${Math.random() * 2.5}s`;
        fireworksContainer.appendChild(firework);
    }
}

function hideWinPopup() {
    winPopup.classList.remove('visible');
    winPopup.classList.add('hidden');
    fireworksContainer.innerHTML = '';
    document.body.classList.remove('pre-win-effect');
}

function showWinToast(rank, count) {
    const icons = { 2: '🥈', 3: '🥉', 4: '🎉', 5: '👍' };
    const toast = document.createElement('div');
    toast.className = `toast-popup toast-rank-${rank}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[rank]}</div>
        <div class="toast-message">
            <strong>${rank}등 당첨!</strong>
            <span>${count.toLocaleString()}번째 추첨에서 달성</span>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
}

function loadUserGameProgress() {
    const leaderboard = JSON.parse(localStorage.getItem('lotto_leaderboard_v2') || '[]');
    const userRecord = leaderboard.find(item => item.id === currentUser);
    
    currentDrawCount = userRecord ? userRecord.count : 0;
    hasWon = userRecord ? userRecord.status === 'won' : false;
    
    drawCountDisplay.textContent = currentDrawCount.toLocaleString();
    
    if (hasWon) {
        drawOnceBtn.disabled = true;
        drawOnceBtn.textContent = "1등 당첨 완료!";
        gameStatusMsg.textContent = "축하합니다! 이미 1등에 당첨되었습니다.";
        gameStatusMsg.style.color = "var(--accent-green)";
    } else {
        drawOnceBtn.disabled = false;
        drawOnceBtn.textContent = "추첨 실행";
        gameStatusMsg.textContent = "1등 당첨 번호가 나올 때까지 클릭하세요!";
        gameStatusMsg.style.color = "var(--text-color-secondary)";
    }
}

function saveGameProgress(status) {
    let leaderboard = JSON.parse(localStorage.getItem('lotto_leaderboard_v2') || '[]');
    const existingIndex = leaderboard.findIndex(item => item.id === currentUser);

    const record = { id: currentUser, count: currentDrawCount, status: status, date: new Date().toLocaleDateString() };

    if (existingIndex !== -1) {
        if (leaderboard[existingIndex].status !== 'won') {
            leaderboard[existingIndex] = record;
        }
    } else {
        leaderboard.push(record);
    }

    leaderboard.sort((a, b) => {
        if (a.status === 'won' && b.status !== 'won') return -1;
        if (a.status !== 'won' && b.status === 'won') return 1;
        if (a.status === 'won' && b.status === 'won') return a.count - b.count;
        return b.count - a.count;
    });

    localStorage.setItem('lotto_leaderboard_v2', JSON.stringify(leaderboard));
    updateLeaderboardUI();
}

function saveRecentWin(rank, count) {
    const allWins = JSON.parse(localStorage.getItem('lotto_recent_wins') || '{}');
    if (!allWins[currentUser]) allWins[currentUser] = [];

    const entry = { rank, count, date: new Date().toLocaleString() };
    allWins[currentUser].unshift(entry);

    if(allWins[currentUser].length > 50) allWins[currentUser].pop(); // 최신 50개만 저장

    localStorage.setItem('lotto_recent_wins', JSON.stringify(allWins));
}

function updateRecentWinsUI() {
    if (!currentUser) return;
    const allWins = JSON.parse(localStorage.getItem('lotto_recent_wins') || '{}');
    const userWins = allWins[currentUser] || [];

    if (userWins.length === 0) {
        recentWinsList.innerHTML = '<p class="empty-msg">아직 당첨 기록이 없습니다.</p>';
        return;
    }
    
    recentWinsList.innerHTML = userWins.map(item => `
        <div class="recent-win-item">
            <span class="win-rank win-rank-${item.rank}">${item.rank}등</span>
            <span class="win-details">${item.count.toLocaleString()}회차</span>
        </div>
    `).join('');
}

function resetUserGame() {
    if (!currentUser || !confirm("모든 게임 기록(1등 도전, 최근 당첨)을 초기화하시겠습니까?")) return;

    let leaderboard = JSON.parse(localStorage.getItem('lotto_leaderboard_v2') || '[]');
    leaderboard = leaderboard.filter(item => item.id !== currentUser);
    localStorage.setItem('lotto_leaderboard_v2', JSON.stringify(leaderboard));

    let allWins = JSON.parse(localStorage.getItem('lotto_recent_wins') || '{}');
    delete allWins[currentUser];
    localStorage.setItem('lotto_recent_wins', JSON.stringify(allWins));
    
    currentDrawCount = 0;
    hasWon = false;
    currentDrawBallsContainer.innerHTML = '<div class="empty-balls-placeholder">클릭하여 추첨을 시작하세요</div>';
    currentDrawBallsContainer.style.border = "none";
    currentDrawBallsContainer.style.boxShadow = "none";
    loadUserGameProgress();
    updateLeaderboardUI();
    updateRecentWinsUI();
}

function updateLeaderboardUI() {
    const leaderboard = JSON.parse(localStorage.getItem('lotto_leaderboard_v2') || '[]');
    const winners = leaderboard.filter(item => item.status === 'won');

    if (winners.length === 0) {
        leaderboardList.innerHTML = '<p class="empty-msg">아직 1등 당첨자가 없습니다.</p>';
        return;
    }

    leaderboardList.innerHTML = winners.map((item, index) => `
        <div class="leader-item ${item.id === currentUser ? 'my-rank' : ''}">
            <span class="leader-rank">${index + 1}</span>
            <span class="leader-id">${item.id}</span>
            <span class="leader-count">${item.count.toLocaleString()}회</span>
            <span class="leader-date">${item.date}</span>
        </div>
    `).join('');
}

drawOnceBtn.addEventListener('click', performManualDraw);
resetGameBtn.addEventListener('click', resetUserGame);
winPopupClose.addEventListener('click', hideWinPopup);
winPopupCloseBtn.addEventListener('click', hideWinPopup);

// (The rest of the core logic: saveSetToHistory, deleteFromHistory, updateGlobalStats, updateHistoryUI, updateStatsUI, generation logic, etc. remains the same)

// --- Core Logic (unchanged) ---

function saveSetToHistory(set) {
    if (!currentUser) { alert("로그인이 필요합니다."); return; }
    const allData = JSON.parse(localStorage.getItem('lotto_app_data') || '{}');
    if (!allData[currentUser]) allData[currentUser] = [];
    const isDuplicate = allData[currentUser].some(item => JSON.stringify(item.set) === JSON.stringify(set));
    if (isDuplicate) { alert("이미 저장된 조합입니다."); return; }
    const entry = { date: new Date().toLocaleString(), set: set };
    allData[currentUser].unshift(entry);
    if (allData[currentUser].length > 100) allData[currentUser].pop();
    localStorage.setItem('lotto_app_data', JSON.stringify(allData));
    updateGlobalStats([set]);
    alert("나의 기록에 저장되었습니다!");
    updateHistoryUI();
}

function deleteFromHistory(index) {
    if (!currentUser || !confirm("이 기록을 삭제하시겠습니까?")) return;
    const allData = JSON.parse(localStorage.getItem('lotto_app_data') || '{}');
    if (allData[currentUser]) {
        allData[currentUser].splice(index, 1);
        localStorage.setItem('lotto_app_data', JSON.stringify(allData));
        updateHistoryUI();
    }
}

function updateGlobalStats(sets) {
    const stats = JSON.parse(localStorage.getItem('lotto_global_stats') || '{"numbers": {}, "sums": [], "oddEven": {"odd": 0, "even": 0}}');
    sets.forEach(nums => {
        const sum = nums.reduce((a, b) => a + b, 0);
        stats.sums.push(sum);
        nums.forEach(n => {
            stats.numbers[n] = (stats.numbers[n] || 0) + 1;
            if (n % 2 === 0) stats.oddEven.even++; else stats.oddEven.odd++;
        });
    });
    localStorage.setItem('lotto_global_stats', JSON.stringify(stats));
}

function updateHistoryUI() {
    if (!currentUser) return;
    const allData = JSON.parse(localStorage.getItem('lotto_app_data') || '{}');
    const userHistory = allData[currentUser] || [];
    profileStat.textContent = `저장된 조합: ${userHistory.length}개`;
    if (userHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">저장된 기록이 없습니다. 번호 생성 후 "저장" 버튼을 눌러주세요.</p>';
        return;
    }
    historyList.innerHTML = userHistory.map((item, index) => `
        <div class="history-item">
            <div class="history-info">
                <span class="history-date">${item.date}</span>
                <button class="delete-btn" onclick="deleteFromHistory(${index})">삭제</button>
            </div>
            <div class="history-balls">
                ${item.set.map(n => `<div class="lotto-ball ball-sm" style="background:${getBallColor(n)}">${n}</div>`).join('')}
            </div>
        </div>
    `).join('');
}

function updateStatsUI() {
    const stats = JSON.parse(localStorage.getItem('lotto_global_stats') || '{"numbers": {}, "sums": [], "oddEven": {"odd": 0, "even": 0}}');
    for(let i=1; i<=45; i++) { if(!stats.numbers[i]) stats.numbers[i] = 0; }
    const topNumsContainer = document.getElementById('top-numbers');
    const sortedNumsDesc = Object.entries(stats.numbers).sort((a, b) => b[1] - a[1]);
    const top5 = sortedNumsDesc.slice(0, 5);
    const maxFreq = top5.length > 0 ? top5[0][1] : 1;
    topNumsContainer.innerHTML = top5.length > 0 ? top5.map(([num, count]) => `<div class="bar-wrapper"><span class="bar-label">${num}번</span><div class="bar-track"><div class="bar-fill" style="width: ${maxFreq ? (count/maxFreq)*100 : 0}%"></div></div><span class="bar-value">${count}회</span></div>`).join('') : '<p class="empty-msg">데이터 수집 중...</p>';
    const bottomNumsContainer = document.getElementById('bottom-numbers');
    const bottom5 = sortedNumsDesc.filter(x => x[1] > 0).reverse().slice(0, 5);
    if (bottom5.length === 0) {
        bottomNumsContainer.innerHTML = '<p class="empty-msg">데이터 수집 중...</p>';
    } else {
        const bottomMax = bottom5[0][1];
        bottomNumsContainer.innerHTML = bottom5.map(([num, count]) => `<div class="bar-wrapper"><span class="bar-label">${num}번</span><div class="bar-track"><div class="bar-fill" style="width: ${(count/bottomMax)*100}%; background: #5856d6"></div></div><span class="bar-value">${count}</span></div>`).join('');
    }
    const sumContainer = document.getElementById('sum-distribution');
    if (stats.sums.length > 0) {
        const ranges = {"100미만": 0, "100-139": 0, "140-170": 0, "170초과": 0};
        stats.sums.forEach(s => { if (s < 100) ranges["100미만"]++; else if (s <= 139) ranges["100-139"]++; else if (s <= 170) ranges["140-170"]++; else ranges["170초과"]++; });
        const maxRange = Math.max(...Object.values(ranges));
        sumContainer.innerHTML = Object.entries(ranges).map(([label, count]) => `<div class="bar-wrapper"><span class="bar-label" style="width:60px">${label}</span><div class="bar-track"><div class="bar-fill" style="width: ${(count/maxRange)*100}%; background: #007aff"></div></div><span class="bar-value">${count}</span></div>`).join('');
    } else { sumContainer.innerHTML = '<p class="empty-msg">데이터 수집 중...</p>'; }
    const oeContainer = document.getElementById('odd-even-stats');
    const total = stats.oddEven.odd + stats.oddEven.even;
    if (total > 0) {
        const oddP = Math.round((stats.oddEven.odd / total) * 100);
        const evenP = 100 - oddP;
        oeContainer.innerHTML = `<div class="bar-wrapper"><span class="bar-label">홀수</span><div class="bar-track"><div class="bar-fill" style="width: ${oddP}%; background: #ff3b30"></div></div><span class="bar-value">${oddP}%</span></div><div class="bar-wrapper"><span class="bar-label">짝수</span><div class="bar-track"><div class="bar-fill" style="width: ${evenP}%; background: #007aff"></div></div><span class="bar-value">${evenP}%</span></div>`;
    } else { oeContainer.innerHTML = '<p class="empty-msg">데이터 수집 중...</p>'; }
}

function generateMathBasis(numbers) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evens = numbers.filter(n => n % 2 === 0).length;
    const odds = 6 - evens;
    const freqCount = numbers.filter(n => frequentNumbers.includes(n)).length;
    const meanDeviation = Math.abs(138 - sum).toFixed(1);
    const weightScore = (freqCount * 12.5).toFixed(1);
    const entropy = (Math.random() * 0.2 + 0.7).toFixed(3);
    return `<strong>[분석 데이터 리포트]</strong><br>• 역사적 빈도 가중치: ${weightScore}pt<br>• 기대값 편차: Σ(n)=${sum} (Δ${meanDeviation})<br>• 조합 밸런스: 홀짝 ${odds}:${evens}<br>• 클러스터링 지수: ${entropy} H(s)`;
}

function calculateProbability(numbers) {
    let score = 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evens = numbers.filter(n => n % 2 === 0).length;
    numbers.forEach(num => { if (frequentNumbers.includes(num)) score += 12; else score += 4; });
    if (sum >= 100 && sum <= 170) score += 15;
    if (evens >= 2 && evens <= 4) score += 13;
    const baseProb = Math.floor((score / 100) * 100);
    return Math.min(Math.max(baseProb, 45), 98);
}

function getBallColor(number) {
    if (number <= 10) return 'var(--accent-yellow)';
    if (number <= 20) return 'var(--accent-blue)';
    if (number <= 30) return 'var(--accent-red)';
    if (number <= 40) return 'var(--text-color-secondary)';
    return 'var(--accent-green)';
}

generateBtn.addEventListener('click', () => {
    if (!currentUser) { alert("ID를 먼저 입력하고 접속해주세요."); return; }
    generateLottoNumbers();
    if (isFirstGeneration) { welcomeMessage.classList.add('hidden'); resultArea.classList.remove('hidden'); isFirstGeneration = false; }
});

function generateLottoNumbers() {
    lottoRowsContainer.innerHTML = '';
    for (let row = 0; row < 5; row++) {
        const numbers = new Set();
        while (numbers.size < 6) { numbers.add(weightedPool[Math.floor(Math.random() * weightedPool.length)]); }
        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
        const probability = calculateProbability(sortedNumbers);
        const mathBasis = generateMathBasis(sortedNumbers);
        const rowWrapper = document.createElement('div');
        rowWrapper.classList.add('row-wrapper');
        const rowLabel = document.createElement('span');
        rowLabel.classList.add('row-label');
        rowLabel.textContent = `SET ${String.fromCharCode(65 + row)}`;
        const ballsContainer = document.createElement('div');
        ballsContainer.classList.add('balls-container');
        sortedNumbers.forEach((number) => { const ball = document.createElement('div'); ball.classList.add('lotto-ball'); ball.textContent = number; ball.style.background = getBallColor(number); ballsContainer.appendChild(ball); });
        const actionGroup = document.createElement('div');
        actionGroup.classList.add('action-group');
        const probBadge = document.createElement('div');
        probBadge.classList.add('prob-badge');
        probBadge.innerHTML = `<span class="prob-value">${probability}%</span><div class="detail-tooltip">${mathBasis}</div>`;
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('save-row-btn');
        saveBtn.textContent = '저장';
        saveBtn.onclick = () => saveSetToHistory(sortedNumbers);
        actionGroup.appendChild(probBadge);
        actionGroup.appendChild(saveBtn);
        rowWrapper.appendChild(rowLabel);
        rowWrapper.appendChild(ballsContainer);
        rowWrapper.appendChild(actionGroup);
        lottoRowsContainer.appendChild(rowWrapper);
    }
}

init();
