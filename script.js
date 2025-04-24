function createQuestions() {
    const count = parseInt(document.getElementById('questionCount').value);
    const form = document.getElementById('questionForm');
    form.innerHTML = '';
  
    for (let i = 0; i < count; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'question-wrapper';
  
      wrapper.innerHTML = `
        <h3>Soru ${i + 1}</h3>
        <textarea placeholder="Soruyu yazın" name="q${i}_text" required></textarea>
        <label>Soru Türü:</label>
        <select name="q${i}_type" onchange="toggleOptions(this, ${i})">
          <option value="text">Yazılı</option>
          <option value="multiple">Çoktan Seçmeli</option>
        </select>
        <div class="options" id="options_${i}" style="display: none;">
          ${['A', 'B', 'C', 'D', 'E'].map(letter => `
            <input type="text" placeholder="${letter} şıkkı" name="q${i}_opt_${letter}" />
          `).join('')}
        </div>
        <label>Cevap Anahtarı:</label>
        <input type="text" name="q${i}_answer" placeholder="Doğru cevap örn: A veya yazılı cevap">
      `;
  
      form.appendChild(wrapper);
    }
  }
  
  function toggleOptions(select, index) {
    const optDiv = document.getElementById(`options_${index}`);
    optDiv.style.display = select.value === 'multiple' ? 'block' : 'none';
  }
  
  function saveExam() {
    const form = document.getElementById("questionForm");
    const wrappers = form.querySelectorAll(".question-wrapper");
    const questions = [];
  
    wrappers.forEach((wrapper, index) => {
      const text = wrapper.querySelector(`textarea[name='q${index}_text']`).value;
      const type = wrapper.querySelector(`select[name='q${index}_type']`).value;
      const answer = wrapper.querySelector(`input[name='q${index}_answer']`).value;
  
      const options = {};
      if (type === 'multiple') {
        ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
          const input = wrapper.querySelector(`input[name='q${index}_opt_${letter}']`);
          options[letter] = input ? input.value : '';
        });
      }
  
      questions.push({ text, type, answer, options });
    });
  
    const duration = document.getElementById("examDuration").value;
    localStorage.setItem("examData", JSON.stringify(questions));
    localStorage.setItem("examDuration", duration);
    alert("Sınav başarıyla kaydedildi. Giriş ekranına dönülüyor...");
    window.location.href = "login.html";
  }
  
  function loadExamForStudent() {
    const exam = JSON.parse(localStorage.getItem('examData'));
    const form = document.getElementById('studentExamForm');
    form.innerHTML = '';
  
    exam.forEach((q, index) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `<h3>${index + 1}. ${q.text}</h3>`;
      if (q.type === 'multiple') {
        for (const [key, val] of Object.entries(q.options)) {
          if (val) {
            const label = document.createElement('label');
            label.className = 'option-label';
            label.innerHTML = `
              <input type="radio" name="q${index}" value="${key}"> <span>${key}) ${val}</span>
            `;
            wrapper.appendChild(label);
          }
        }
      } else {
        wrapper.innerHTML += `<textarea name="q${index}" placeholder="Cevabınızı yazın"></textarea>`;
      }
      form.appendChild(wrapper);
    });
  
    const duration = parseInt(localStorage.getItem('examDuration'));
    if (!isNaN(duration)) startTimer(duration);
  }
  
  function submitExam() {
    const exam = JSON.parse(localStorage.getItem('examData'));
    const answers = {};
    exam.forEach((_, i) => {
      const input = document.querySelector(`[name='q${i}']:checked`) || document.querySelector(`[name='q${i}']`);
      answers[`q${i}`] = input ? input.value.trim() : '';
    });
    localStorage.setItem('studentAnswers', JSON.stringify(answers));
    window.location.href = 'results.html';
  }
  
  function showResults() {
    const exam = JSON.parse(localStorage.getItem('examData'));
    const answers = JSON.parse(localStorage.getItem('studentAnswers'));
    const resultDiv = document.getElementById('resultSummary');
    resultDiv.innerHTML = '';
  
    exam.forEach((q, index) => {
      const studentAnswer = answers[`q${index}`] || '';
      const correct = q.answer.trim().toLowerCase() === studentAnswer.toLowerCase();
  
      const result = document.createElement('div');
      result.className = correct ? 'tick correct' : 'cross incorrect';
      result.innerHTML = `<strong>${index + 1}. Soru:</strong> ${q.text}<br>Yanıtınız: ${studentAnswer || 'Boş'}<br>Doğru Cevap: ${q.answer}`;
      resultDiv.appendChild(result);
    });
  }
  
  function startTimer(minutes) {
    let time = minutes * 60;
    const timerDisplay = document.getElementById("timer");
  
    const countdown = setInterval(() => {
      const min = Math.floor(time / 60);
      const sec = time % 60;
      timerDisplay.textContent = `${min}:${sec < 10 ? '0' + sec : sec}`;
      time--;
  
      if (time < 0) {
        clearInterval(countdown);
        alert("Süre doldu. Sınavınız otomatik olarak gönderiliyor.");
        submitExam();
      }
    }, 1000);
  }
  
  if (location.pathname.includes('exam.html')) loadExamForStudent();
  if (location.pathname.includes('results.html')) showResults();
  