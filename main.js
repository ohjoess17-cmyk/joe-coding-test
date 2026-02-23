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
        weightedPool.push(i); // 가중치 부여
        weightedPool.push(i);
    }
}

// 확률 계산 함수 (가상 통계 기반)
function calculateProbability(numbers) {
    let score = 0;
    numbers.forEach(num => {
        if (frequentNumbers.includes(num)) score += 15;
        else score += 5;
    });
    // 최대 점수 대비 정규화 (1~100 사이의 정수로 반환)
    const baseProb = Math.floor((score / 90) * 100);
    return Math.min(Math.max(baseProb, 1), 99); 
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
        probBadge.innerHTML = `<span class="prob-text">적중률</span> <span class="prob-value">${probability}%</span>`;

        rowWrapper.appendChild(rowLabel);
        rowWrapper.appendChild(ballsContainer);
        rowWrapper.appendChild(probBadge);
        
        lottoRowsContainer.appendChild(rowWrapper);
    }
}

generateBtn.addEventListener('click', handleGenerateClick);
