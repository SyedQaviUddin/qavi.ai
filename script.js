let chatHistory = [];

function toggleHistory() {
  const historyBar = document.querySelector('.history-bar');
  const historyContent = document.querySelector('.history-content');
  historyBar.classList.toggle('active');
  historyContent.style.display = historyBar.classList.contains('active') ? 'block' : 'none';
}

function saveHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function loadHistory() {
  const storedHistory = localStorage.getItem('chatHistory');
  if (storedHistory) {
    chatHistory = JSON.parse(storedHistory);
    updateHistoryUI();
  }
}

function addToHistory(prompt, response) {
  if (!chatHistory.some(chat => chat.prompt === prompt && chat.response === response)) {
    chatHistory.push({ prompt, response });
    saveHistory();
    updateHistoryUI();
  }
}

function updateHistoryUI() {
  const chatHistoryElement = document.getElementById('chat-history');
  chatHistoryElement.innerHTML = chatHistory
    .map((chat, index) => `
      <li onclick="loadChat(${index})">
        <strong>Prompt:</strong> ${chat.prompt}<br>
        <strong>Response:</strong> ${chat.response.substring(0, 50)}...
      </li>
    `)
    .join('');
}

function loadChat(index) {
  const chat = chatHistory[index];
  document.getElementById('prompt').value = chat.prompt;
  document.getElementById('chat-output').innerHTML = `
    <div class="chat-message">
      <strong>Prompt:</strong> ${chat.prompt}<br>
      <strong>Response:</strong> ${chat.response}
    </div>
  `;
}

async function generateLimerick() {
  const prompt = document.getElementById('prompt').value.trim();
  const resultElement = document.getElementById('chat-output');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const button = document.querySelector('button');

  if (!prompt) {
    alert('Please enter a prompt to generate information.');
    return;
  }

  button.disabled = true;
  button.textContent = 'Generating...';
  loadingElement.style.display = 'block';
  errorElement.style.display = 'none';

  try {
    const detailedPrompt = `${prompt}. Provide response, minimum 100 words. Keep the response natural.`;
    const response = await fetch('/generate-limerick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: detailedPrompt })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.limerick) {
      resultElement.innerHTML = '';
      addToHistory(prompt, data.limerick);
      typeText(resultElement, data.limerick);
    } else {
      resultElement.textContent = 'No information generated. Please try again.';
    }
  } catch (error) {
    errorElement.style.display = 'block';
    resultElement.textContent = 'Something went wrong. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = 'Generate Information';
    loadingElement.style.display = 'none';
  }
}

function typeText(element, text, speed = 20) {
  element.innerHTML = '';
  let index = 0;
  function type() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }
  type();
}

function startVoiceInput() {
  const micButton = document.querySelector('.mic-button');
  micButton.classList.add('listening');
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = (event) => {
    document.getElementById('prompt').value = event.results[0][0].transcript;
    micButton.classList.remove('listening');
  };
  recognition.onerror = () => micButton.classList.remove('listening');
}

function clearInput() {
  document.getElementById('prompt').value = '';
  document.getElementById('chat-output').textContent = 'Your information will appear here...';
}

let synth = window.speechSynthesis;
let utterance;

function readAloud() {
  let text = document.getElementById("chat-output").innerText;
  let readButton = document.getElementById("read-aloud-btn");
  if (synth.speaking) {
    synth.cancel();
    readButton.textContent = "Read Aloud";
    return;
  }
  if (text.trim() !== "") {
    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => readButton.textContent = "Read Aloud";
    synth.speak(utterance);
    readButton.textContent = "Stop Reading";
  }
}

document.getElementById("read-aloud-btn").addEventListener("click", readAloud);
document.getElementById("read-aloud-btn").addEventListener("dblclick", () => synth.cancel());

document.getElementById('upload-section').addEventListener('dragover', (e) => {
  e.preventDefault();
  document.getElementById('upload-section').classList.add('drag-over');
});

document.getElementById('upload-section').addEventListener('dragleave', () => {
  document.getElementById('upload-section').classList.remove('drag-over');
});

document.getElementById('upload-section').addEventListener('drop', (e) => {
  e.preventDefault();
  document.getElementById('upload-section').classList.remove('drag-over');
  document.getElementById('image-upload').files = e.dataTransfer.files;
});

async function uploadImage() {
  const fileInput = document.getElementById('image-upload');
  if (!fileInput.files.length) {
    alert('Please select an image.');
    return;
  }
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);
  try {
    const response = await fetch('/upload-image', { method: 'POST', body: formData });
    const data = await response.json();
    document.getElementById('chat-output').textContent = data.analysis || 'Error analyzing image.';
  } catch (error) {
    document.getElementById('chat-output').textContent = 'Error uploading image.';
  }
}

window.onload = loadHistory;
