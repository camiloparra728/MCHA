

// git add .
// git commit -m "Initial commit"

// git push -u origin main
// git push heroku main   
// heroku logs --tail
//git remote set-url origin https://github.com/camiloparra728/MCHA.git


import { createBot, MemoryDB,createProvider, createFlow, addKeyword } from '@bot-whatsapp/bot'; 
import { BaileysProvider } from '@bot-whatsapp/provider-baileys';  
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Estado de los usuarios para el chatbot interactivo
let userSteps = {};

// Función para manejar los flujos del chatbot
const startClubFlorBot = () => {
    return addKeyword(['hola', 'menu'])
        .addAnswer('¡Hola! Bienvenido al *Club Flor*. Estoy aquí para ayudarte.')
        .addAnswer('¿Cuál es tu nombre?', { capture: true }, (ctx, { flowDynamic }) => {
            userSteps[ctx.from] = { step: 1, name: ctx.body };
            flowDynamic('Elige el tipo de producto (Amnesia / Gorila Glue / Sour Diésel) y la cantidad en GR:');
        })
        .addAnswer('Por favor, proporciona tu dirección (Apartamento/Torre/Casa):', { capture: true }, (ctx, { flowDynamic }) => {
            userSteps[ctx.from].product = ctx.body;
            flowDynamic('Por favor, comparte tu ubicación GPS:');
        })
        .addAnswer('¿Cuál es tu método de pago (NEQUI o DAVIPLATA)?', { capture: true }, (ctx, { flowDynamic }) => {
            userSteps[ctx.from].location = ctx.body;
            flowDynamic('Por favor, proporciona el número de contacto:');
        })
        .addAnswer('Envía el comprobante de pago. Nuestro asesor te contactará pronto.', { capture: true }, (ctx) => {
            userSteps[ctx.from].paymentMethod = ctx.body;
            console.log('Datos del usuario:', userSteps[ctx.from]);
            userSteps[ctx.from] = { step: 1 };  // Resetea el estado del usuario
        });
};

// Función para crear o cargar la sesión del chatbot
const createOrLoadSession = async (sessionName) => {
    const sessionPath = path.join(__dirname, `${sessionName}-session.json`);

    let baileysProvider=createProvider(BaileysProvider);
    if (fs.existsSync(sessionPath)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
        baileysProvider = createProvider(BaileysProvider, {
            session: sessionData,  // Utilizamos los datos de la sesión almacenada
            authPath: sessionPath, // Ruta para almacenar la sesión de Baileys
        });
    } else {
        baileysProvider = createProvider(BaileysProvider, {
            authPath: sessionPath,  // Ruta para almacenar la sesión de Baileys
        });
    }

    const flow = createFlow([startClubFlorBot()]);
    const bot = createBot({
        flow,
        database: new MemoryDB(),
        provider: baileysProvider,
    });

    // Mostrar el QR en la terminal
    baileysProvider.on('qr', (qrCode) => {
        console.log('QR Code generado. Escanéalo en tu dispositivo.');
        qrcode.generate(qrCode, { small: true });  // Esto imprime el QR en la terminal
    });

    // Mostrar el estado cuando el bot esté listo
    baileysProvider.on('ready', () => {
        console.log('Bot listo para enviar y recibir mensajes.');
    });

    // Manejar error de autenticación
    baileysProvider.on('auth_failure', (msg) => {
        console.error('Error de autenticación:', msg);
    });
};

// Crear o cargar las sesiones para los dos chatbots
createOrLoadSession('clubflor-3229765480');
// createOrLoadSession('clubflor-3229756712');


