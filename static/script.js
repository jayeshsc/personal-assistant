// This script handles the chat interface and the communication with the server.

document.addEventListener("DOMContentLoaded", function () {
  const usernameEntry = document.getElementById('username-entry');
  const usernameInput = document.getElementById('username-input');
  const usernameButton = document.getElementById('username-button');
  const chatContainer = document.getElementById('chat-container');
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  let conversationId = '';
  let username = '';

  // Function to display a message in the chat
  function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
  }

 
  function greetUser() {
    const currentTime = new Date();
    const hour = currentTime.getHours();

    let greeting = '';

    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    displayMessage(`${greeting}, ${username}! Welcome to the chat.`);
  }

  // Event listener for the username submission
  usernameButton.addEventListener('click', () => {
    const enteredUsername = usernameInput.value.trim();
    if (enteredUsername !== '') {
      username = enteredUsername;
      usernameEntry.style.display = 'none';
      chatContainer.style.display = 'block';
      greetUser();
      startConversation();
    }
  });

  // Event listener for sending messages
  sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message !== '') {
      sendMessage(message);
      messageInput.value = '';
    }
  });

// Display loading spinner
function showLoadingSpinner() {
const loadingSpinner = document.getElementById('loading-spinner');
loadingSpinner.style.display = 'block';
}

// Hide loading spinner
function hideLoadingSpinner() {
const loadingSpinner = document.getElementById('loading-spinner');
loadingSpinner.style.display = 'none';
}


function startConversation() {
showLoadingSpinner(); 
fetch('/start_conversation', { method: 'POST' })
  .then(response => response.json())
  .then(data => {
    conversationId = data.conversation_id;
    displayMessage('Conversation started.');
    hideLoadingSpinner(); 
  })
  .catch(error => {
    console.error('Error starting conversation:', error);
    hideLoadingSpinner(); 
  });
}

function sendMessage(message) {
if (!conversationId) {
  displayMessage('Error: Conversation not started.');
  return;
}

showLoadingSpinner(); 
fetch('/continue_conversation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    conversation_id: conversationId,
    message: message
  })
})
  .then(response => response.json())
  .then(data => {
    displayMessage(`${username}: ${message}`);
    displayMessage(`Jayu AI: ${data.response}`);
    hideLoadingSpinner();
  })
  .catch(error => {
    console.error('Error sending message:', error);
    hideLoadingSpinner();
  });
}
}); 
