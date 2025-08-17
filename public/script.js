const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const themeToggle = document.getElementById('theme-toggle');

let chatHistory = [];

// Theme switcher logic
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
  }
}

themeToggle.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  const newTheme = isDarkMode ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
});

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  chatHistory.push({ role: 'user', content: userMessage });
  input.value = '';

  const thinkingMsgElement = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send only the last message as per the request
      // To send history, use: body: JSON.stringify({ messages: chatHistory })
      body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }] }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from server.');
    }

    const data = await response.json();

    if (data.result) {
      // Ubah Markdown dari bot menjadi HTML agar bisa dibaca
      thinkingMsgElement.innerHTML = marked.parse(data.result);
      chatHistory.push({ role: 'model', content: data.result });
    } else {
      // Gunakan textContent untuk pesan error biasa
      thinkingMsgElement.textContent = 'Maaf, tidak ada respons yang diterima.';
    }
  } catch (error) {
    console.error('Error:', error);
    thinkingMsgElement.textContent = error.message || 'Failed to get response from server.';
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  // Gunakan innerHTML untuk pesan bot agar formatnya (Markdown) bisa ditampilkan.
  // Gunakan textContent untuk pesan pengguna demi keamanan.
  if (sender === 'bot') {
    msg.innerHTML = text;
  } else {
    msg.textContent = text;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
