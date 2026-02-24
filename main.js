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
    userStatus.textContent = `반갑습니다, ${id}님!`;
    userStatus.style.color = "#2ecc71";
    generateBtn.disabled = false;
    userIdInput.disabled = true;
    loginBtn.textContent = "로그아웃";
    loginBtn.onclick = handleLogout;
    
    // Update My Page Info
    profileId.textContent = `${id} 님`;
    
    updateHistoryUI();
    updateStatsUI();
}

function handleLogout() {
    if (confirm("로그아웃 하시겠습니까?")) {
        location.reload(); // Refresh as requested
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
    });
});

// --- Core Logic ---

function saveSetToHistory(set) {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
    }
    
    const allData = JSON.parse(localStorage.getItem('lotto_app_data') || '{}');
    if (!allData[currentUser]) allData[currentUser] = [];
    
    // Check if already saved
    const isDuplicate = allData[currentUser].some(item => 
        JSON.stringify(item.set) === JSON.stringify(set)
    );
    
    if (isDuplicate) {
        alert("이미 저장된 조합입니다.");
        return;
    }

    const entry = {
        date: new Date().toLocaleString(),
        set: set
    };
    
    allData[currentUser].unshift(entry);
    if (allData[currentUser].length > 100) allData[currentUser].pop();
    
    localStorage.setItem('lotto_app_data', JSON.stringify(allData));
    
    // Update global stats
    updateGlobalStats([set]);
    
    alert("나의 기록에 저장되었습니다!");
    updateHistoryUI();
}

function deleteFromHistory(index) {
    if (!currentUser) return;
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;

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
    
    // Fill missing numbers in stats
    for(let i=1; i<=45; i++) {
        if(!stats.numbers[i]) stats.numbers[i] = 0;
    }

    // Top Numbers
    const topNumsContainer = document.getElementById('top-numbers');
    const sortedNumsDesc = Object.entries(stats.numbers).sort((a, b) => b[1] - a[1]);
    const top5 = sortedNumsDesc.slice(0, 5);
    const maxFreq = top5.length > 0 ? top5[0][1] : 1;
    
    topNumsContainer.innerHTML = top5.length > 0 ? top5.map(([num, count]) => `
        <div class="bar-wrapper">
            <span class="bar-label">${num}번</span>
            <div class="bar-track"><div class="bar-fill" style="width: ${maxFreq ? (count/maxFreq)*100 : 0}%"></div></div>
            <span class="bar-value">${count}회</span>
        </div>
    `).join('') : '<p class="empty-msg">데이터 수집 중...</p>';

    // Bottom Numbers
    const bottomNumsContainer = document.getElementById('bottom-numbers');
    const bottom5 = sortedNumsDesc.filter(x => x[1] > 0).reverse().slice(0, 5);
    if (bottom5.length === 0) {
        bottomNumsContainer.innerHTML = '<p class="empty-msg">데이터 수집 중...</p>';
    } else {
        const bottomMax = bottom5[0][1];
        bottomNumsContainer.innerHTML = bottom5.map(([num, count]) => `
            <div class="bar-wrapper">
                <span class="bar-label">${num}번</span>
                <div class="bar-track"><div class="bar-fill" style="width: ${(count/bottomMax)*100}%; background: #95a5a6"></div></div>
                <span class="bar-value">${count}회</span>
            </div>
        `).join('');
    }

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

// --- Generation Logic ---

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
        • 역사적 빈도 가중치: ${weightScore}pt<br>
        • 기대값 편차: Σ(n)=${sum} (Δ${meanDeviation})<br>
        • 조합 밸런스: 홀짝 ${odds}:${evens}<br>
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

generateBtn.addEventListener('click', () => {
    if (!currentUser) {
        alert("ID를 먼저 입력하고 접속해주세요.");
        return;
    }
    
    generateLottoNumbers();
    
    if (isFirstGeneration) {
        welcomeMessage.classList.add('hidden');
        resultArea.classList.remove('hidden');
        isFirstGeneration = false;
    }
});

function generateLottoNumbers() {
    lottoRowsContainer.innerHTML = '';
    
    for (let row = 0; row < 5; row++) {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            numbers.add(weightedPool[randomIndex]);
        }

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

        sortedNumbers.forEach((number) => {
            const ball = document.createElement('div');
            ball.classList.add('lotto-ball');
            ball.textContent = number;
            ball.style.background = getBallColor(number);
            ballsContainer.appendChild(ball);
        });

        const actionGroup = document.createElement('div');
        actionGroup.classList.add('action-group');

        const probBadge = document.createElement('div');
        probBadge.classList.add('prob-badge');
        probBadge.innerHTML = `
            <span class="prob-value">${probability}%</span>
            <div class="detail-tooltip">${mathBasis}</div>
        `;

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
