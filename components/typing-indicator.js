function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator message-animation';
    typingDiv.id = 'typing-' + Date.now();
    
    typingDiv.innerHTML = `
        <div class="bubble-content">
            <div class="bot-icon"><i class="fas fa-user-md"></i></div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv.id;
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}