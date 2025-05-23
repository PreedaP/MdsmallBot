function createMessageElement(sender, text) {
    const messageDiv = document.createElement('div');
    
    // ตรวจสอบว่าเป็นข้อความแสดงข้อผิดพลาดหรือไม่
    const isError = text.includes('ขออภัย') || text.includes('ปัญหา') || text.includes('ผิดพลาด');
    const isWarning = text.includes('กรุณา') || text.includes('โปรด');
    
    messageDiv.className = `message-bubble ${sender}-message message-animation ${
        isError ? 'error-message' : isWarning ? 'warning-message' : ''
    }`;
    
    const bubbleContent = document.createElement('div');
    bubbleContent.className = 'bubble-content';
    
    if (sender === 'bot') {
        const botIcon = document.createElement('div');
        botIcon.className = 'bot-icon';
        botIcon.innerHTML = '<i class="fas fa-user-md"></i>';
        bubbleContent.appendChild(botIcon);
    }
    
    const textElement = document.createElement('p');
    textElement.textContent = text;
    bubbleContent.appendChild(textElement);
    
    if (sender === 'user') {
        const userIcon = document.createElement('div');
        userIcon.className = 'user-icon';
        userIcon.innerHTML = '<i class="fas fa-user"></i>';
        bubbleContent.appendChild(userIcon);
    }
    
    messageDiv.appendChild(bubbleContent);
    return messageDiv;
}