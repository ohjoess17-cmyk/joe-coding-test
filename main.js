const lottoNumbersContainer = document.querySelector('.lotto-numbers');
const generateBtn = document.querySelector('.generate-btn');

const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];

function generateLottoNumbers() {
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach((number, index) => {
        const circle = document.createElement('div');
        circle.classList.add('lotto-number');
        circle.textContent = number;
        circle.style.backgroundColor = colors[index];
        lottoNumbersContainer.appendChild(circle);
    });
}

generateBtn.addEventListener('click', generateLottoNumbers);

// 초기 로딩 시 번호 생성
generateLottoNumbers();
