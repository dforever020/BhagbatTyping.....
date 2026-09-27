let currentCategory = 'BSF HCM';
let passagesDatabase = {};
let examTimer = null;
let secondsLeft = 600;

// Initialize 100 Test Passages (Header text removed - Direct Paragraph Start)
for (let i = 1; i <= 100; i++) {
    passagesDatabase[i] = `Typing speed and accuracy are crucial parameters for clearing qualifying skill exams. Consistent daily practice with exact key combinations improves muscle memory and overall accuracy under strict timer constraints. Regular typing exercise helps candidates maintain focus and proper posture during high pressure government examination tests.`;
}

document.addEventListener('DOMContentLoaded', () => {
    const selectElem = document.getElementById('passageSelect');
    for (let i = 1; i <= 100; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.innerText = `Test Passage - ${i}`;
        selectElem.appendChild(option);
    }
    renderHistoryTable();
});

function nav(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function selectCategory(catName) {
    currentCategory = catName;
    document.getElementById('btnBSF').classList.toggle('active', catName === 'BSF HCM');
    document.getElementById('btnCRPF').classList.toggle('active', catName === 'CRPF');
}

function toggleTextVisibility() {
    const isChecked = document.getElementById('hideTextToggle').checked;
    document.getElementById('paragraphBox').classList.toggle('hidden-text', isChecked);
}

function startTypingTest() {
    nav('testScreen');
    document.getElementById('currentCatTitle').innerText = currentCategory;
    
    const passageIndex = document.getElementById('passageSelect').value;
    document.getElementById('paragraphBox').innerText = passagesDatabase[passageIndex];
    toggleTextVisibility();

    const inputArea = document.getElementById('typedInput');
    inputArea.value = '';
    inputArea.focus();

    secondsLeft = 600;
    clearInterval(examTimer);
    examTimer = setInterval(() => {
        secondsLeft--;
        let min = Math.floor(secondsLeft / 60);
        let sec = secondsLeft % 60;
        document.getElementById('timer').innerText = `${min}:${sec < 10 ? '0' : ''}${sec}`;
        if (secondsLeft <= 0) submitTest();
    }, 1000);
}

function submitTest() {
    clearInterval(examTimer);

    let originalStr = document.getElementById('paragraphBox').innerText.trim();
    let typedStr = document.getElementById('typedInput').value;

    let typedLength = typedStr.length;
    let givenLength = originalStr.length;

    let totalErrors = 0;
    for (let i = 0; i < typedLength; i++) {
        if (i >= originalStr.length || typedStr[i] !== originalStr[i]) {
            totalErrors++;
        }
    }

    let givenWords = Math.round(givenLength / 5);
    let typedWordsCount = typedLength / 5;
    
    let totalSecondsTaken = 600 - secondsLeft;
    if (totalSecondsTaken <= 0) totalSecondsTaken = 1;
    let timeSpentMins = totalSecondsTaken / 60;

    let grossSpeed = typedWordsCount / timeSpentMins;
    let netSpeed = Math.max(0, grossSpeed - (totalErrors / timeSpentMins));
    let accuracyPerc = typedLength > 0 ? Math.max(0, ((typedLength - totalErrors) / typedLength) * 100) : 0;
    let errorPerc = typedLength > 0 ? (totalErrors / typedLength) * 100 : 0;
    let isPassed = netSpeed >= 35 && errorPerc <= 5;

    let mistakesIgnoredVal = (givenWords * 0.05).toFixed(1);

    document.getElementById('resCategory').innerText = currentCategory;
    document.getElementById('resTopYourError').innerText = errorPerc.toFixed(2) + '%';
    
    let topBadge = document.getElementById('resTopStatus');
    topBadge.innerText = isPassed ? "PASS" : "FAIL";
    topBadge.className = isPassed ? "status-pass-badge" : "status-fail-badge";

    let qualText = document.getElementById('qualText');
    let qualIcon = document.getElementById('qualIcon');
    let qualHeader = document.getElementById('qualHeader');

    if (isPassed) {
        qualText.innerText = "QUALIFIED";
        qualIcon.innerText = "✔";
        qualHeader.className = "qual-title";
    } else {
        qualText.innerText = "NOT QUALIFIED";
        qualIcon.innerText = "✖";
        qualHeader.className = "qual-title disqualified";
    }

    document.getElementById('resGross').innerText = grossSpeed.toFixed(2);
    document.getElementById('resNet').innerText = netSpeed.toFixed(2);
    document.getElementById('resAcc').innerText = accuracyPerc.toFixed(2) + ' %';
    document.getElementById('resErr').innerText = errorPerc.toFixed(2) + ' %';
    document.getElementById('resGivenWords').innerText = givenWords;
    document.getElementById('resTypedWords').innerText = Math.round(typedWordsCount);
    document.getElementById('resOmission').innerText = '0';
    document.getElementById('resFullMistakes').innerText = totalErrors;
    document.getElementById('resHalfMistakes').innerText = '0';
    document.getElementById('resTotalErrorUnits').innerText = totalErrors.toFixed(1);
    document.getElementById('resMistakesIgnored').innerText = mistakesIgnoredVal;

    let minsTaken = Math.floor(totalSecondsTaken / 60);
    let secsTaken = totalSecondsTaken % 60;
    document.getElementById('resTimeTaken').innerText = `${minsTaken < 10 ? '0' : ''}${minsTaken}:${secsTaken < 10 ? '0' : ''}${secsTaken}`;

    document.getElementById('resTypedParagraph').innerText = typedStr;
    document.getElementById('resOriginalParagraph').innerText = originalStr;

    saveToHistory(currentCategory, netSpeed.toFixed(1), accuracyPerc.toFixed(1) + '%', isPassed ? "PASS" : "FAIL");
    nav('resultScreen');
}

function saveToHistory(cat, net, acc, status) {
    let logs = JSON.parse(localStorage.getItem('typingLogs') || '[]');
    logs.unshift({ date: new Date().toLocaleDateString(), cat, net, acc, status });
    localStorage.setItem('typingLogs', JSON.stringify(logs));
    renderHistoryTable();
}

function renderHistoryTable() {
    let logs = JSON.parse(localStorage.getItem('typingLogs') || '[]');
    let tbody = document.getElementById('historyTableBody');
    if (logs.length === 0) return;

    tbody.innerHTML = logs.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.cat}</td>
            <td>${item.net} WPM</td>
            <td>${item.acc}</td>
            <td class="${item.status === 'PASS' ? 'status-pass-badge' : 'status-fail-badge'}">${item.status}</td>
        </tr>
    `).join('');
}
