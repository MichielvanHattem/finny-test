const messagesDiv = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('input');

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  append('user', text);
  input.value = '';
  const res = await fetch('/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.FINNY_TOKEN
    },
    body: JSON.stringify({ message: text })
  });
  const data = await res.json();
  append('finny', data.answer || data.error);
});

function append(role, text) {
  const div = document.createElement('div');
  div.className = role;
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
