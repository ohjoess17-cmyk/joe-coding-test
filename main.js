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

let currentUser = null;
let isFirstGeneration = true;

const frequentNumbers = [43, 34, 12, 27, 17, 13, 19, 6, 33, 15, 7, 30, 3];
const weightedPool = [];

for (let i = 1; i <= 45; i++) {
    weightedPool.push(i);
    if (frequentNumbers.includes(i)) {
        weightedPool.push(i); 
        weightedPool.push(i);
    }
}

// --- User & Tab Logic ---

function handleLogin() {
    const id = userIdInput.value.trim();
    if (!id) {
        alert("ID를 입력해주세요.");
        return;
    }
    currentUser = id;
    userStatus.textContent = `반갑습니다, ${id}님! 번호를 분석할 준비가 되었습니다.`;
    userStatus.style.color = "#2ecc71";
    generateBtn.disabled = false;
    userIdInput.disabled = true;
    loginBtn.textContent = "로그아웃";
    loginBtn.onclick = handleLogout;
    
    updateHistoryUI();
    updateStatsUI();
}

function handleLogout() {
    currentUser = null;
    userStatus.textContent = "로그인이 필요합니다";
    userStatus.style.color = "#a29bfe";
    generateBtn.disabled = true;
    userIdInput.disabled = false;
    userIdInput.value = "";
    loginBtn.textContent = "접속";
    loginBtn.onclick = handleLogin;
    
    // Reset views
    welcomeMessage.classList.remove('hidden');
    resultArea.classList.add('hidden');
    isFirstGeneration = true;
}

loginBtn.onclick = handleLogin;

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${target}-tab`).classList.add('active');
        
        if (target === 'history') updateHistoryUI();
        if (target === 'stats') updateStatsUI();
    });
});

// --- Core Logic ---

function saveToHistory(sets) {
    if (!currentUser) return;
    
    const allData = JSON.parse(localStorage.getItem('lotto_app_data') || '{}');
    if (!allData[currentUser]) allData[currentUser] = [];
    
    const entry = {
        date: new Date().toLocaleString(),
        sets: sets
    };
    
    allData[currentUser].unshift(entry);
    // Keep last 50 entries
    if (allData[currentUser].length > 50) allData[currentUser].pop();
    
    localStorage.setItem('lotto_app_data', JSON.stringify(allData));
    
    // Update global stats
    updateGlobalStats(sets);
}

function updateGlobalStats(sets) {
    const stats = JSON.parse(localStorage.getItem('lotto_global_stats') || '{"numbers": {}, "sums": [], "oddEven": {"odd": 0, "even": 0}}');
    
    sets.forEach(nums => {
        const sum = nums.reduce((a, b) => a + b, 0);
        stats.sums.push(sum);
        
        nums.forEach(n => {
            stats.numbers[n] = (stats.numbers[n] || 0) + 1;
            if (n % 2 === 0) stats.oddEven.even++;
            else stats.oddEven.odd++;
        });
    });
    
    localStorage.setItem('lotto_global_stats', JSON.stringify(stats));
}

function updateHistoryUI() {
    if (!currentUser) return;
    const allData = JSON.parse(localStorage.getItem('lotto_app_data') || '{}');
    const userHistory = allData[currentUser] || [];
    
    if (userHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">기록이 없습니다. 번호를 먼저 생성해주세요.</p>';
        return;
    }
    
    historyList.innerHTML = userHistory.map(item => `
        <div class="history-item">
            <span class="history-date">${item.date}</span>
            <div class="history-balls">
                ${item.sets[0].map(n => `<div class="lotto-ball ball-sm" style="background:${getBallColor(n)}">${n}</div>`).join('')}
            </div>
            <p style="font-size:0.7rem; color:#b2bec3; margin-top:5px;">외 ${item.sets.length-1}개 조합 생성됨</p>
        </div>
    `).join('');
}

function updateStatsUI() {
    const stats = JSON.parse(localStorage.getItem('lotto_global_stats') || '{"numbers": {}, "sums": [], "oddEven": {"odd": 0, "even": 0}}');
    
    // Top Numbers
    const topNumsContainer = document.getElementById('top-numbers');
    const sortedNums = Object.entries(stats.numbers).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxFreq = sortedNums.length > 0 ? sortedNums[0][1] : 1;
    
    topNumsContainer.innerHTML = sortedNums.length > 0 ? sortedNums.map(([num, count]) => `
        <div class="bar-wrapper">
            <span class="bar-label">${num}번</span>
            <div class="bar-track"><div class="bar-fill" style="width: ${(count/maxFreq)*100}%"></div></div>
            <span class="bar-value">${count}회</span>
        </div>
    `).join('') : '<p class="empty-msg">데이터 수집 중...</p>';

    // Sum Distribution
    const sumContainer = document.getElementById('sum-distribution');
    if (stats.sums.length > 0) {
        const ranges = {"100미만": 0, "100-139": 0, "140-170": 0, "170초과": 0};
        stats.sums.forEach(s => {
            if (s < 100) ranges["100미만"]++;
            else if (s <= 139) ranges["100-139"]++;
            else if (s <= 170) ranges["140-170"]++;
            else ranges["170초과"]++;
        });
        const maxRange = Math.max(...Object.values(ranges));
        sumContainer.innerHTML = Object.entries(ranges).map(([label, count]) => `
            <div class="bar-wrapper">
                <span class="bar-label" style="width:60px">${label}</span>
                <div class="bar-track"><div class="bar-fill" style="width: ${(count/maxRange)*100}%; background: #3498db"></div></div>
                <span class="bar-value">${count}</span>
            </div>
        `).join('');
    } else {
        sumContainer.innerHTML = '<p class="empty-msg">데이터 수집 중...</p>';
    }

    // Odd Even
    const oeContainer = document.getElementById('odd-even-stats');
    const total = stats.oddEven.odd + stats.oddEven.even;
    if (total > 0) {
        const oddP = Math.round((stats.oddEven.odd / total) * 100);
        const evenP = 100 - oddP;
        oeContainer.innerHTML = `
            <div class="bar-wrapper">
                <span class="bar-label">홀수</span>
                <div class="bar-track"><div class="bar-fill" style="width: ${oddP}%; background: #e74c3c"></div></div>
                <span class="bar-value">${oddP}%</span>
            </div>
            <div class="bar-wrapper">
                <span class="bar-label">짝수</span>
                <div class="bar-track"><div class="bar-fill" style="width: ${evenP}%; background: #3498db"></div></div>
                <span class="bar-value">${evenP}%</span>
            </div>
        `;
    } else {
        oeContainer.innerHTML = '<p class="empty-msg">데이터 수집 중...</p>';
    }
}

// --- Original Generation Logic (Modified) ---

function generateMathBasis(numbers) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evens = numbers.filter(n => n % 2 === 0).length;
    const odds = 6 - evens;
    const freqCount = numbers.filter(n => frequentNumbers.includes(n)).length;
    
    const meanDeviation = Math.abs(138 - sum).toFixed(1);
    const weightScore = (freqCount * 12.5).toFixed(1);
    const entropy = (Math.random() * 0.2 + 0.7).toFixed(3);
    
    return `
        <strong>[분석 데이터 리포트]</strong><br>
        • 역사적 빈도 가중치: ${weightScore}pt (출현 빈도 상위 번호 ${freqCount}개 포함)<br>
        • 기대값 편차: Σ(n)=${sum} (표준 기대값 138 대비 Δ${meanDeviation})<br>
        • 조합 밸런스: 홀짝 비율 ${odds}:${evens} (안정 지수 ${odds === 3 ? '최상' : '보통'})<br>
        • 알고리즘: Monte Carlo Simulation 기반 가중 확률분석 적용<br>
        • 클러스터링 지수: ${entropy} H(s)
    `;
}

function calculateProbability(numbers) {
    let score = 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evens = numbers.filter(n => n % 2 === 0).length;
    
    numbers.forEach(num => {
        if (frequentNumbers.includes(num)) score += 12;
        else score += 4;
    });
    
    if (sum >= 100 && sum <= 170) score += 15;
    if (evens >= 2 && evens <= 4) score += 13;
    
    const baseProb = Math.floor((score / 100) * 100);
    return Math.min(Math.max(baseProb, 45), 98);
}

function getBallColor(number) {
    if (number <= 10) return 'linear-gradient(135deg, #f1c40f, #f39c12)';
    if (number <= 20) return 'linear-gradient(135deg, #3498db, #2980b9)';
    if (number <= 30) return 'linear-gradient(135deg, #e74c3c, #c0392b)';
    if (number <= 40) return 'linear-gradient(135deg, #bdc3c7, #95a5a6)';
    return 'linear-gradient(135deg, #2ecc71, #27ae60)';
}

function handleGenerateClick() {
    if (!currentUser) {
        alert("ID를 먼저 입력하고 접속해주세요.");
        return;
    }

    if (!isFirstGeneration) {
        const confirmChange = confirm("기록이 저장되었습니다. 새로운 번호를 생성하시겠습니까?");
        if (!confirmChange) return;
    }
    
    generateLottoNumbers();
    
    if (isFirstGeneration) {
        welcomeMessage.classList.add('hidden');
        resultArea.classList.remove('hidden');
        isFirstGeneration = false;
    }
}

function generateLottoNumbers() {
    lottoRowsContainer.innerHTML = '';
    const currentSets = [];
    
    for (let row = 0; row < 5; row++) {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            numbers.add(weightedPool[randomIndex]);
        }

        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
        currentSets.push(sortedNumbers);
        
        const probability = calculateProbability(sortedNumbers);
        const mathBasis = generateMathBasis(sortedNumbers);
        
        const rowWrapper = document.createElement('div');
        rowWrapper.classList.add('row-wrapper');
        
        const rowLabel = document.createElement('span');
        rowLabel.classList.add('row-label');
        rowLabel.textContent = `SET ${String.fromCharCode(65 + row)}`;

        const ballsContainer = document.createElement('div');
        ballsContainer.classList.add('balls-container');

        sortedNumbers.forEach((number) => {
            const ball = document.createElement('div');
            ball.classList.add('lotto-ball');
            ball.textContent = number;
            ball.style.background = getBallColor(number);
            ballsContainer.appendChild(ball);
        });

        const probBadge = document.createElement('div');
        probBadge.classList.add('prob-badge');
        probBadge.innerHTML = `
            <span class="prob-text">적중률</span> 
            <span class="prob-value">${probability}%</span>
            <span class="info-icon">ⓘ</span>
            <div class="detail-tooltip">
                ${mathBasis}
            </div>
        `;

        rowWrapper.appendChild(rowLabel);
        rowWrapper.appendChild(ballsContainer);
        rowWrapper.appendChild(probBadge);
        
        lottoRowsContainer.appendChild(rowWrapper);
    }
    
    saveToHistory(currentSets);
}

generateBtn.addEventListener('click', handleGenerateClick);
