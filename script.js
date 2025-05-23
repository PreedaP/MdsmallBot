document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const medIcons = document.querySelectorAll('.med-icon');
    
    // Session ID
    const sessionId = generateSessionId();
    // เพิ่มปุ่มล้างประวัติแชทใน HTML หรือสร้างแบบไดนามิก
    const clearChatBtn = document.createElement('button');
    clearChatBtn.id = 'clearChatBtn';
    clearChatBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    clearChatBtn.className = 'icon-btn';
    document.querySelector('.chat-header').appendChild(clearChatBtn);

    // เพิ่ม Event Listener สำหรับปุ่มล้างแชท
    clearChatBtn.addEventListener('click', clearChat);
    
    // Initialize
    initChat();
    
    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    voiceBtn.addEventListener('click', startVoiceRecognition);
    minimizeBtn.addEventListener('click', toggleMinimize);
    
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            userInput.value = question;
            sendMessage();
        });
    });
    
    medIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            userInput.value = question;
            sendMessage();
        });
    });
    
    // ฟังก์ชันล้างประวัติแชท
    function clearChat() {
        if (confirm('คุณแน่ใจต้องการลบประวัติการสนทนาทั้งหมดหรือไม่?')) {
            // ล้างข้อความบนหน้าจอ (เก็บ welcome message ไว้)
            const welcomeMsg = document.querySelector('.welcome-message');
            chatMessages.innerHTML = '';
            chatMessages.appendChild(welcomeMsg);
            
            // ล้างข้อมูลใน Local Storage
            localStorage.removeItem('clinic_chat_messages');
            
            // แสดงข้อความยืนยัน
            displayMessage('bot', 'ประวัติการสนทนาถูกล้างเรียบร้อยแล้ว');
            
            // สร้าง session ใหม่
            sessionId = generateSessionId();
        }
    }

    // Functions
    function generateSessionId() {
        return 'session-' + Date.now().toString() + '-' + Math.floor(Math.random() * 1000);
    }
    
    function initChat() {
        // Load previous messages from local storage
        const savedMessages = localStorage.getItem('clinic_chat_messages');
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            messages.forEach(msg => {
                displayMessage(msg.sender, msg.text);
            });
        }
    }
    
    // ปรับปรุงฟังก์ชัน sendMessage() ให้มี error handling ดีขึ้น
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) {
            displayMessage('bot', 'กรุณาพิมพ์ข้อความของคุณ');
            return;
        }
        
        try {
            // Display user message
            displayMessage('user', message);
            userInput.value = '';
            
            // Show typing indicator
            const typingId = showTypingIndicator();
            
            // Get bot response with timeout
            const botResponse = await Promise.race([
                getBotResponse(message),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                )
            ]);
            
            // Remove typing indicator
            removeTypingIndicator(typingId);
            
            // Display bot response
            displayMessage('bot', botResponse);
            
            // Save to local storage
            saveMessagesToLocal();
            
        } catch (error) {
            console.error('Error in sendMessage:', error);
            removeTypingIndicator(typingId);
            
            const errorMsg = error.message.includes('Timeout') 
                ? 'การตอบกลับใช้เวลานานเกินไป กรุณาลองใหม่' 
                : 'ขออภัย มีปัญหาการเชื่อมต่อ กรุณาลองใหม่ในภายหลัง';
                
            displayMessage('bot', errorMsg);
        }
    }
    
    function displayMessage(sender, text) {
        const messageElement = createMessageElement(sender, text);
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // ปรับปรุงฟังก์ชัน getBotResponse() ให้มี error handling ดีขึ้น
    async function getBotResponse(message) {
        try {
            // ในระบบจริงควรเรียก API ที่ backend
            const responses = {
                'นัดหมาย': 'คุณสามารถนัดหมายแพทย์ได้ที่หมายเลข 02-XXX-XXXX หรือผ่าน Line Official @clinic-health',
                'เปิดกี่โมง': 'คลินิกของเราเปิดให้บริการทุกวัน เวลา 08:00-20:00 น.',
                'ราคา': 'แพ็กเกจตรวจสุขภาพพื้นฐานเริ่มต้นที่ 1,500 บาท กรุณาติดต่อเจ้าหน้าที่สำหรับรายละเอียดเพิ่มเติม',
                'ที่อยู่': 'คลินิกสุขภาพดี ตั้งอยู่ที่ 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ',
                'แพทย์': 'คลินิกของเรามีแพทย์ผู้เชี่ยวชาญด้านอายุรกรรม ศัลยกรรม และกุมารเวชกรรม',
                'อาการ': 'สำหรับอาการป่วยทั่วไป กรุณาติดต่อเจ้าหน้าที่ที่หมายเลข 02-XXX-XXXX หรือมาพบแพทย์ที่คลินิก',
                'default': 'ขออภัยด้วย ฉันไม่เข้าใจคำถามของคุณ กรุณาติดต่อเจ้าหน้าที่ที่หมายเลข 02-XXX-XXXX'
            };
            
            // Simple keyword matching with better error handling
            const lowerMessage = message.toLowerCase();
            
            if (!message || message.trim() === '') {
                throw new Error('ข้อความว่างเปล่า');
            }
            
            // จัดการคำถามเกี่ยวกับอาการป่วย
            if (lowerMessage.includes('อาการ') || 
                lowerMessage.includes('ปวด') || 
                lowerMessage.includes('ไข้')) {
                return responses['อาการ'];
            }
            else if (lowerMessage.includes('นัด') || lowerMessage.includes('จอง')) {
                return responses['นัดหมาย'];
            } 
            else if (lowerMessage.includes('เปิด') || lowerMessage.includes('เวลา')) {
                return responses['เปิดกี่โมง'];
            } 
            else if (lowerMessage.includes('ราคา') || lowerMessage.includes('ค่าใช้จ่าย')) {
                return responses['ราคา'];
            } 
            else if (lowerMessage.includes('ที่อยู่') || lowerMessage.includes('location')) {
                return responses['ที่อยู่'];
            } 
            else if (lowerMessage.includes('แพทย์') || lowerMessage.includes('หมอ')) {
                return responses['แพทย์'];
            } 
            else {
                return responses['default'];
            }
            
        } catch (error) {
            console.error('Error generating response:', error);
            return 'ขออภัย มีข้อผิดพลาดในการประมวลผลคำถามของคุณ กรุณาลองใหม่อีกครั้ง';
        }
    }
    
    function startVoiceRecognition() {
        alert('ระบบจดจำเสียงจะทำงานในเวอร์ชันเต็ม');
        // In a real app, you would use the Web Speech API here
    }
    
    function toggleMinimize() {
        alert('ระบบย่อหน้าต่างจะทำงานในเวอร์ชันเต็ม');
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function saveMessagesToLocal() {
        const messages = [];
        document.querySelectorAll('.message-bubble').forEach(bubble => {
            messages.push({
                sender: bubble.classList.contains('user-message') ? 'user' : 'bot',
                text: bubble.querySelector('p').textContent
            });
        });
        
        localStorage.setItem('clinic_chat_messages', JSON.stringify(messages));
    }
});