const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const fs = require('fs');
const path = require('path');
const userSteps = {};

// Función para definir el almacenamiento de las sesiones de forma separada
const createBaileysProviderWithStorage = (storagePath) => {
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    return createProvider(BaileysProvider, {
        auth: { storePath: storagePath }, // Define el almacenamiento personalizado
    });
};

// Flujos y configuraciones para el Club Flor
const startClubFlorBot2 = addKeyword(['hola', 'flor', 'Hola', 'Buenas', 'buenas', '#clubflor'])
    .addAnswer('¡Hola! Bienvenido al *Club Flor*. Estoy aquí para ayudarte.')
    .addAnswer('¿Cuál es tu nombre?', { capture: true }, async (ctx, { flowDynamic }) => {
        console.log('Nombre recibido:', ctx.body);
        userSteps[ctx.from] = { step: 1, name: ctx.body };
        await flowDynamic('Elige el tipo de producto (Amnesia / Gorila Glue / Sour Diésel / Green Poison / Gorila White / Hash Fruit / Gelato 33 / Gorila Rainbow):');
    })
    .addAnswer('Y la cantidad en GR (min. 10GR):', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 1 }, async (ctx, { flowDynamic }) => {
        console.log('Producto recibido:', ctx.body);
        userSteps[ctx.from].product = ctx.body;
        userSteps[ctx.from].step = 2;
        await flowDynamic('Proporciona tu dirección (Apartamento/Torre/Casa):');
    })
    .addAnswer('Indicaciones:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 2 }, async (ctx, { flowDynamic }) => {
        console.log('Dirección recibida:', ctx.body);
        userSteps[ctx.from].address = ctx.body;
        userSteps[ctx.from].step = 4;
        await flowDynamic('¿Método de pago? ');
    })
    .addAnswer('Escribe (NEQUI o DAVIPLATA)', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 4 }, async (ctx, { flowDynamic }) => {
        console.log('Método de pago recibido:', ctx.body);
        userSteps[ctx.from].paymentMethod = ctx.body;
        userSteps[ctx.from].step = 5;
        await flowDynamic('Realiza envío del pago 3156163610 y el comprobante de pago.');
    })
    .addAnswer('Nuestro asesor te contactará pronto.', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 5 }, (ctx) => {
        console.log('Número de contacto recibido:', ctx.body);
        userSteps[ctx.from].contactNumber = ctx.body;
        console.log('Datos del usuario:', userSteps[ctx.from]);
        delete userSteps[ctx.from];
    });

const main = async () => {
    const adapterDB = new MockAdapter();

    // Proveedor 1 (primer número de WhatsApp con su propio almacenamiento)
    const provider1 = createBaileysProviderWithStorage(path.resolve(__dirname, 'sessions/whatsapp1'));
    const flow1 = createFlow([startClubFlorBot2]);
    createBot({
        flow: flow1,
        provider: provider1,
        database: adapterDB,
    });

    // Proveedor 2 (segundo número de WhatsApp con su propio almacenamiento)
    const provider2 = createBaileysProviderWithStorage(path.resolve(__dirname, 'sessions/whatsapp2'));
    const flow2 = createFlow([startClubFlorBot2]); // Puedes usar el mismo flujo o crear otro diferente
    createBot({
        flow: flow2,
        provider: provider2,
        database: adapterDB,
    });

    // Muestra ambos códigos QR en el portal web para escanearlos
    QRPortalWeb();
};

main();
