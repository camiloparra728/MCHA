const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const userSteps = {};

const startClubFlorBot2 = addKeyword(['hola', 'flor', 'Hola'])
    .addAnswer('¡Hola! Bienvenido al *Club Flor*. Estoy aquí para ayudarte.')
    .addAnswer('¿Cuál es tu nombre?', { capture: true }, async (ctx, { flowDynamic }) => {
        console.log('Nombre recibido:', ctx.body);
        userSteps[ctx.from] = { step: 1, name: ctx.body };
        await flowDynamic('Elige el tipo de producto (Amnesia / Gorila Glue / Sour Diésel):');
    })
    .addAnswer('Elige el tipo de producto y cantidad en GR:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 1 }, async (ctx, { flowDynamic }) => {
        console.log('Producto recibido:', ctx.body);
        userSteps[ctx.from].product = ctx.body;
        userSteps[ctx.from].step = 2;  // Actualiza el paso
        await flowDynamic('Proporciona dirección de envío (Apartamento/Torre/Casa):');
    })
    .addAnswer('Proporciona dirección de envío:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 2 }, async (ctx, { flowDynamic }) => {
        console.log('Dirección recibida:', ctx.body);
        userSteps[ctx.from].address = ctx.body;
        userSteps[ctx.from].step = 3;  // Actualiza el paso
        await flowDynamic('Comparte tu ubicación GPS:');
    })
    .addAnswer('Comparte tu ubicación GPS:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 3 }, async (ctx, { flowDynamic }) => {
        console.log('Ubicación recibida:', ctx.body);
        userSteps[ctx.from].location = ctx.body;
        userSteps[ctx.from].step = 4;  // Actualiza el paso
        await flowDynamic('¿Método de pago (NEQUI o DAVIPLATA)?');
    })
    .addAnswer('¿Método de pago (NEQUI o DAVIPLATA)?', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 4 }, async (ctx, { flowDynamic }) => {
        console.log('Método de pago recibido:', ctx.body);
        userSteps[ctx.from].paymentMethod = ctx.body;
        userSteps[ctx.from].step = 5;  // Actualiza el paso
        await flowDynamic('Proporciona el número de contacto:');
    })
    .addAnswer('Proporciona el número de contacto:', { capture: true, expected: (ctx) => userSteps[ctx.from]?.step === 5 }, (ctx) => {
        console.log('Número de contacto recibido:', ctx.body);
        userSteps[ctx.from].contactNumber = ctx.body;
        console.log('Datos del usuario:', userSteps[ctx.from]);
        userSteps[ctx.from] = { step: 1 };  // Resetea el estado del usuario
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
