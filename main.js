const lottoRowsContainer = document.querySelector('.lotto-rows-container');
const generateBtn = document.querySelector('.generate-btn');

const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];

// 역대 당첨 번호 통계를 기반으로 가중치를 부여한 번호 풀 생성
// (가장 많이 나온 번호들: 43, 34, 12, 27, 17, 13, 19, 6, 33, 15, 7, 30, 3)
const weightedPool = [];
const frequentNumbers = [43, 34, 12, 27, 17, 13, 19, 6, 33, 15, 7, 30, 3];

// 1~45번까지 기본적으로 넣고, 자주 나온 번호는 3번씩 더 넣어서 확률을 높임
for (let i = 1; i <= 45; i++) {
    weightedPool.push(i);
    if (frequentNumbers.includes(i)) {
        weightedPool.push(i);
        weightedPool.push(i);
        weightedPool.push(i);
    }
}

function generateLottoNumbers() {
    lottoRowsContainer.innerHTML = '';
    
    // 5줄 생성
    for (let row = 0; row < 5; row++) {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            numbers.add(weightedPool[randomIndex]);
        }

        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('lotto-row');

        sortedNumbers.forEach((number) => {
            const circle = document.createElement('div');
            circle.classList.add('lotto-number');
            circle.textContent = number;
            
            // 공 색깔 입히기 (동행복권 스타일)
            if (number <= 10) circle.style.backgroundColor = '#f1c40f'; // 노랑
            else if (number <= 20) circle.style.backgroundColor = '#3498db'; // 파랑
            else if (number <= 30) circle.style.backgroundColor = '#e74c3c'; // 빨강
            else if (number <= 40) circle.style.backgroundColor = '#95a5a6'; // 회색
            else circle.style.backgroundColor = '#2ecc71'; // 초록
            
            rowDiv.appendChild(circle);
        });
        
        lottoRowsContainer.appendChild(rowDiv);
    }
}

generateBtn.addEventListener('click', generateLottoNumbers);

// 초기 로딩 시 번호 생성
generateLottoNumbers();
