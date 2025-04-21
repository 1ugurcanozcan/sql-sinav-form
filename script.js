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
    const formData = new FormData(document.getElementById('questionForm'));
    const questions = [];
    const questionCount = parseInt(document.getElementById('questionCount').value);
  
    for (let i = 0; i < questionCount; i++) {
      const q = {
        text: formData.get(`q${i}_text`),
        type: formData.get(`q${i}_type`),
        options: {},
        answer: formData.get(`q${i}_answer`)
      };
      if (q.type === 'multiple') {
        ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
          q.options[letter] = formData.get(`q${i}_opt_${letter}`);
        });
      }
      questions.push(q);
    }
  
    localStorage.setItem('examData', JSON.stringify(questions));
    alert('Sınav kaydedildi! Şimdi öğrenci sayfasını açabilirsiniz.');
    window.location.href = 'exam.html';
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
  
  if (location.pathname.includes('exam.html')) loadExamForStudent();
  if (location.pathname.includes('results.html')) showResults();
  
  
  
  