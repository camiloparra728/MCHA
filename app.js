const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const userSteps = {};

const startClubFlorBot2 = addKeyword(['hola', 'flor', 'Hola'])
    .addAnswer('¡Hola! Bienvenido al *Club Flor*. Estoy aquí para ayudarte.')
    .addAnswer('¿Cuál es tu nombre?', { capture: true }, async (ctx, { flowDynamic }) => {
        console.log('Nombre recibido:', ctx.body); // Log del nombre recibido
        userSteps[ctx.from] = { step: 1, name: ctx.body };
        await flowDynamic('Elige el tipo de producto (Amnesia / Gorila Glue / Sour Diésel):');
    })
    .addAnswer('Elige el tipo de producto:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 1 }, async (ctx, { flowDynamic }) => {
        console.log('Producto recibido:', ctx.body); // Log del producto recibido
        userSteps[ctx.from].product = ctx.body;
        userSteps[ctx.from].step = 2; // Avanza al siguiente paso
        await flowDynamic('Proporciona tu dirección (Apartamento/Torre/Casa):');
    })
    .addAnswer('Proporciona dirección de envío:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 2 }, async (ctx, { flowDynamic }) => {
        console.log('Dirección recibida:', ctx.body); // Log de la dirección recibida
        userSteps[ctx.from].address = ctx.body;
        userSteps[ctx.from].step = 3; // Avanza al siguiente paso
        await flowDynamic('Comparte tu ubicación GPS:');
    })
    .addAnswer('Comparte tu ubicación GPS:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 3 }, async (ctx, { flowDynamic }) => {
        console.log('Ubicación recibida:', ctx.body); // Log de la ubicación recibida
        userSteps[ctx.from].location = ctx.body;
        userSteps[ctx.from].step = 4; // Avanza al siguiente paso
        await flowDynamic('¿Método de pago (NEQUI o DAVIPLATA)?');
    })
    .addAnswer('¿Método de pago (NEQUI o DAVIPLATA)?', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 4 }, async (ctx, { flowDynamic }) => {
        console.log('Método de pago recibido:', ctx.body); // Log del método de pago recibido
        userSteps[ctx.from].paymentMethod = ctx.body;
        userSteps[ctx.from].step = 5; // Avanza al siguiente paso
        await flowDynamic('Proporciona el número de contacto:');
    })
    .addAnswer('Proporciona el número de contacto:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 5 }, (ctx) => {
        console.log('Número de contacto recibido:', ctx.body); // Log del número de contacto recibido
        userSteps[ctx.from].contactNumber = ctx.body;
        console.log('Datos del usuario:', userSteps[ctx.from]); // Log de todos los datos del usuario
        delete userSteps[ctx.from];  // Resetea el estado del usuario
    });

    
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([startClubFlorBot2])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
