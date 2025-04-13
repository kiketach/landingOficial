// Configuración para Vertex AI
const VERTEX_AI_CONFIG = {
    PROJECT_ID: 'hat-trick-9319c', // Reemplaza con tu Project ID de Google Cloud
    LOCATION: 'us-central1', // Región donde esté desplegado tu agente
    MODEL_ID: 'gemini-1.0-pro', // Actualizado a Gemini Pro en lugar de chat-bison
    API_ENDPOINT: 'https://us-central1-aiplatform.googleapis.com/v1/projects/hat-trick-9319c/locations/us-central1/publishers/google/models/gemini-1.0-pro:predict'
};

// Token de autorización (se obtendrá de forma segura)
let AUTH_TOKEN = null;

// Variables para controlar intentos de autenticación
const MAX_AUTH_RETRIES = 3;
let authRetries = 0;

// Elementos del DOM
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Historial de mensajes para contexto
let messageHistory = [
    {
        role: 'assistant',
        content: '¡Hola! Soy el asistente virtual de Hat Trick. ¿En qué puedo ayudarte hoy?'
    }
];

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Conectar el botón del navbar con el modal de chat
    const atencionBtn = document.querySelector('a[href="#portfolio"]');
    if (atencionBtn) {
        atencionBtn.setAttribute('data-bs-toggle', 'modal');
        atencionBtn.setAttribute('data-bs-target', '#chatModal');
        atencionBtn.removeAttribute('href');
    }

    // Inicializar el formulario de chat
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    
    // Intentar obtener token al cargar
    getAuthToken();
});

// Función para obtener un token de autenticación de Google Cloud
async function getAuthToken() {
    try {
        // En un ambiente real, esta solicitud debería hacerse desde el backend
        // Aquí estamos simulando la obtención de un token
        
        // Opción 1: Usar Firebase Auth para obtener un token de ID
        // const user = firebase.auth().currentUser;
        // if (user) {
        //     const idToken = await user.getIdToken();
        //     AUTH_TOKEN = idToken;
        //     return idToken;
        // }
        
        // Opción 2: Para desarrollo, usar una función serverless o API proxy
        const response = await fetch('https://us-central1-hat-trick-9319c.cloudfunctions.net/getVertexAIToken', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener token de autenticación');
        }
        
        const data = await response.json();
        AUTH_TOKEN = data.token;
        console.log('Token de autenticación obtenido correctamente');
        return AUTH_TOKEN;
        
    } catch (error) {
        console.error('Error al obtener token:', error);
        authRetries++;
        
        if (authRetries < MAX_AUTH_RETRIES) {
            console.log(`Reintentando autenticación (${authRetries}/${MAX_AUTH_RETRIES})...`);
            setTimeout(getAuthToken, 1000 * authRetries); // Esperar más tiempo entre reintentos
        } else {
            console.error('Número máximo de intentos de autenticación alcanzado');
        }
        
        return null;
    }
}

// Función para manejar el envío de mensajes
async function handleChatSubmit(event) {
    event.preventDefault();
    
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    
    // Limpiar el input
    chatInput.value = '';
    
    // Mostrar el mensaje del usuario en el chat
    addMessageToChat('user', userMessage);
    
    // Añadir el mensaje al historial
    messageHistory.push({
        role: 'user',
        content: userMessage
    });
    
    // Mostrar indicador de carga
    const loadingIndicator = addLoadingIndicator();
    
    try {
        // Obtener respuesta de Vertex AI
        const response = await getVertexAIResponse(userMessage);
        
        // Eliminar el indicador de carga
        loadingIndicator.remove();
        
        // Mostrar la respuesta del asistente
        if (response && response.content) {
            addMessageToChat('assistant', response.content);
            
            // Añadir la respuesta al historial
            messageHistory.push({
                role: 'assistant',
                content: response.content
            });
        } else {
            throw new Error('Respuesta vacía del asistente');
        }
    } catch (error) {
        console.error('Error al procesar mensaje:', error);
        
        // Eliminar el indicador de carga
        loadingIndicator.remove();
        
        // Mostrar mensaje de error
        addMessageToChat('assistant', 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }
}

// Función para añadir mensajes al chat
function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `d-flex mb-3 ${role === 'user' ? 'justify-content-end' : ''}`;
    
    if (role === 'assistant') {
        messageDiv.innerHTML = `
            <div class="chat-avatar me-2">
                <img src="assets/img/Logo.png" alt="Hat Trick" class="rounded-circle" width="40" height="40">
            </div>
            <div class="chat-message p-3 rounded" style="background-color: #e9ecef; max-width: 80%;">
                <p class="mb-0">${content}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="chat-message p-3 rounded" style="background-color: #dcf8c6; max-width: 80%;">
                <p class="mb-0">${content}</p>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll al final del chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Añadir indicador de carga mientras se espera la respuesta
function addLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'd-flex mb-3';
    loadingDiv.innerHTML = `
        <div class="chat-avatar me-2">
            <img src="assets/img/Logo.png" alt="Hat Trick" class="rounded-circle" width="40" height="40">
        </div>
        <div class="chat-message p-3 rounded" style="background-color: #e9ecef; max-width: 80%;">
            <div class="spinner-grow spinner-grow-sm text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm text-primary mx-1" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return loadingDiv;
}

// Función para obtener respuesta de Vertex AI
async function getVertexAIResponse(userMessage) {
    try {
        // Verificar si tenemos token, si no intentar obtenerlo
        if (!AUTH_TOKEN) {
            AUTH_TOKEN = await getAuthToken();
            
            // Si aún no tenemos token, usar respuestas simuladas
            if (!AUTH_TOKEN) {
                return getFallbackResponse(userMessage);
            }
        }
        
        // Preparar los datos para enviar a Vertex AI - Actualizado para formato Gemini
        const requestData = {
            instances: [
                {
                    prompt: {
                        text: `
                        CONTEXTO:
                        Eres un asistente virtual para la tienda de zapatillas deportivas Hat Trick.
                        Responde siempre en español de forma cortés y concisa.
                        Hat Trick se especializa en zapatillas para fútbol sala y fútbol 5, con modelos en cuero (99.900 pesos)
                        y sintético (89.900 pesos). Tenemos tres tipos de suela: Goma (para superficies lisas y baldosas),
                        Colores o Negra (para superficies como cemento), y Torretin (para césped sintético).
                        Tenemos tallas disponibles desde la 32 hasta la 43.
                        
                        HISTORIAL DE CONVERSACIÓN:
                        ${messageHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}
                        
                        CONSULTA ACTUAL:
                        Usuario: ${userMessage}
                        
                        Tu respuesta:
                        `
                    }
                }
            ],
            parameters: {
                temperature: 0.2,
                maxOutputTokens: 256,
                topK: 40,
                topP: 0.95
            }
        };
        
        // Hacer la solicitud a la API de Vertex AI
        const response = await fetch(VERTEX_AI_CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(requestData)
        });
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta de Vertex AI:', errorText);
            
            // Si es un error de autenticación, intentar renovar el token
            if (response.status === 401 || response.status === 403) {
                console.log('Token expirado o inválido, renovando...');
                AUTH_TOKEN = null;
                AUTH_TOKEN = await getAuthToken();
                
                // Si obtuvimos un nuevo token, reintentar la solicitud
                if (AUTH_TOKEN) {
                    return getVertexAIResponse(userMessage); // Llamada recursiva, pero solo una vez
                }
            }
            
            // Si no podemos recuperarnos, usar respuesta de fallback
            return getFallbackResponse(userMessage);
        }
        
        // Procesar la respuesta - Actualizado para formato Gemini
        const data = await response.json();
        
        // Extraer la respuesta del modelo
        if (data && data.predictions && data.predictions.length > 0) {
            const assistantResponse = data.predictions[0].content.text || data.predictions[0].content || data.predictions[0].text;
            return { content: assistantResponse };
        } else {
            throw new Error('Formato de respuesta inesperado de Vertex AI');
        }
        
    } catch (error) {
        console.error('Error al obtener respuesta de Vertex AI:', error);
        
        // En caso de error, usar respuesta de fallback
        return getFallbackResponse(userMessage);
    }
}

// Función de respaldo para cuando Vertex AI no está disponible
function getFallbackResponse(userMessage) {
    console.log('Usando respuesta de fallback');
    
    // Simular retardo
    return new Promise(resolve => {
        setTimeout(() => {
            // Lógica simple basada en palabras clave
            let response = { content: '' };
            
            const lowerUserMessage = userMessage.toLowerCase();
            
            if (lowerUserMessage.includes('hola') || lowerUserMessage.includes('saludos')) {
                response.content = '¡Hola! ¿En qué puedo ayudarte con nuestras zapatillas Hat Trick?';
            } 
            else if (lowerUserMessage.includes('precio') || lowerUserMessage.includes('costo') || lowerUserMessage.includes('valor')) {
                response.content = 'Nuestras zapatillas tienen precios competitivos: modelos de cuero desde $99.900 y modelos sintéticos desde $89.900. ¿Te gustaría saber más sobre algún modelo específico?';
            }
            else if (lowerUserMessage.includes('talla') || lowerUserMessage.includes('medida') || lowerUserMessage.includes('tamaño')) {
                response.content = 'Tenemos tallas disponibles desde la 32 hasta la 43. ¿Qué talla necesitas?';
            }
            else if (lowerUserMessage.includes('envío') || lowerUserMessage.includes('envio') || lowerUserMessage.includes('entrega')) {
                response.content = 'Realizamos envíos a nivel nacional. Los tiempos de entrega varían según la ubicación: ciudades principales 2-3 días hábiles, otras zonas 3-5 días hábiles.';
            }
            else if (lowerUserMessage.includes('pago') || lowerUserMessage.includes('formas de pago') || lowerUserMessage.includes('métodos de pago')) {
                response.content = 'Aceptamos diferentes métodos de pago: tarjetas de crédito, débito, transferencias bancarias y pagos contra entrega en algunas zonas.';
            }
            else if (lowerUserMessage.includes('tienda') || lowerUserMessage.includes('física') || lowerUserMessage.includes('local')) {
                response.content = 'Nuestra tienda física está ubicada en el barrio Quiroga en Bogotá. También puedes comprar todos nuestros productos a través de nuestra página web.';
            }
            else {
                response.content = 'Gracias por tu mensaje. Para brindarte una mejor atención, ¿podrías darme más detalles sobre tu consulta relacionada con nuestras zapatillas?';
            }
            
            resolve(response);
        }, 800);
    });
}

// Exportar funciones para uso en otros archivos si es necesario
export { messageHistory, addMessageToChat }; 