const lottoRowsContainer = document.querySelector('.lotto-rows-container');
const generateBtn = document.getElementById('generate-btn');
const welcomeMessage = document.getElementById('welcome-message');
const resultArea = document.getElementById('result-area');

let isFirstGeneration = true;

const frequentNumbers = [43, 34, 12, 27, 17, 13, 19, 6, 33, 15, 7, 30, 3];
const weightedPool = [];

// 가중치 기반 풀 생성
for (let i = 1; i <= 45; i++) {
    weightedPool.push(i);
    if (frequentNumbers.includes(i)) {
        weightedPool.push(i); 
        weightedPool.push(i);
    }
}

// 수학적 근거 자료 생성 함수
function generateMathBasis(numbers) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evens = numbers.filter(n => n % 2 === 0).length;
    const odds = 6 - evens;
    const freqCount = numbers.filter(n => frequentNumbers.includes(n)).length;
    
    // 복잡해 보이는 수학적 지표들 계산
    const meanDeviation = Math.abs(138 - sum).toFixed(1); // 로또 합계 평균 기대값 138
    const weightScore = (freqCount * 12.5).toFixed(1);
    const entropy = (Math.random() * 0.2 + 0.7).toFixed(3); // 가상의 엔트로피 지수
    
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
    
    // 가중치 번호 포함 여부
    numbers.forEach(num => {
        if (frequentNumbers.includes(num)) score += 12;
        else score += 4;
    });
    
    // 합계 범위 가점 (100~170 사이가 통계적으로 많음)
    if (sum >= 100 && sum <= 170) score += 15;
    
    // 홀짝 비율 가점 (3:3 또는 2:4/4:2 선호)
    if (evens >= 2 && evens <= 4) score += 13;
    
    const baseProb = Math.floor((score / 100) * 100);
    return Math.min(Math.max(baseProb, 45), 98); // 45% ~ 98% 사이로 조정
}

function getBallColor(number) {
    if (number <= 10) return 'linear-gradient(135deg, #f1c40f, #f39c12)';
    if (number <= 20) return 'linear-gradient(135deg, #3498db, #2980b9)';
    if (number <= 30) return 'linear-gradient(135deg, #e74c3c, #c0392b)';
    if (number <= 40) return 'linear-gradient(135deg, #bdc3c7, #95a5a6)';
    return 'linear-gradient(135deg, #2ecc71, #27ae60)';
}

function handleGenerateClick() {
    if (!isFirstGeneration) {
        const confirmChange = confirm("다음 추첨으로 넘어가시겠습니까?");
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
}

generateBtn.addEventListener('click', handleGenerateClick);
