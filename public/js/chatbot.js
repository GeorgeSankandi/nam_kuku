// This function sends a POST request to our GraphQL endpoint
async function askGraphQL(question) {
    const query = `
        query AskChatbot($question: String!) {
            askChatbot(question: $question) {
                reply
                navigationTarget
                highlightProductId
            }
        }
    `;

    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { question },
            }),
        });

        const jsonResponse = await response.json();
        if (jsonResponse.errors) {
            console.error('GraphQL Errors:', jsonResponse.errors);
            return { reply: "Sorry, something went wrong with the request." };
        }
        return jsonResponse.data.askChatbot;
    } catch (error) {
        console.error('Network error asking chatbot:', error);
        return { reply: "Sorry, I'm unable to connect right now." };
    }
}

function highlightProduct(productId) {
    // Remove any existing highlights first
    document.querySelectorAll('.product-highlight').forEach(el => {
        el.classList.remove('product-highlight');
    });

    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        productCard.classList.add('product-highlight');

        // Remove the highlight after a few seconds
        setTimeout(() => {
            productCard.classList.remove('product-highlight');
        }, 4000);
    }
}


export function initChatbot() {
    const container = document.querySelector('.chatbot-container');
    const toggleBtn = document.querySelector('.chat-toggle-btn');
    const closeBtn = document.querySelector('.chat-close-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    // Function to add a message to the chat window
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        // Scroll to the bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Toggle chat widget visibility
    toggleBtn.addEventListener('click', () => container.classList.add('open'));
    closeBtn.addEventListener('click', () => container.classList.remove('open'));

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userQuestion = chatInput.value.trim();
        if (!userQuestion) return;

        addMessage(userQuestion, 'user');
        chatInput.value = '';

        // Add a temporary "typing" message for the bot
        addMessage('Thinking...', 'bot');
        const { reply, navigationTarget, highlightProductId } = await askGraphQL(userQuestion);
        
        // Remove the "typing" message
        messagesContainer.removeChild(messagesContainer.lastChild);
        
        addMessage(reply, 'bot');

        // Check for navigation target and act on it
        if (navigationTarget) {
            // Give user a moment to read the reply before navigating
            setTimeout(() => {
                location.hash = navigationTarget;
                // We don't close the widget here anymore
            }, 1500);
        }

        // Check for a product to highlight; if so navigate to the product page first
        if (highlightProductId) {
            const targetHash = `#product/${highlightProductId}`;
            // If we're not already on the product page, navigate there first
            if (location.hash !== targetHash) {
                location.hash = targetHash;
                // Give the router a moment to render the product page, then highlight
                setTimeout(() => highlightProduct(highlightProductId), 600);
            } else {
                // Already on the product page — just highlight
                setTimeout(() => highlightProduct(highlightProductId), 300);
            }
        }
    });
}