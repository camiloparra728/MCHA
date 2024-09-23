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
        await flowDynamic('Elige el tipo de producto (Amnesia / Gorila Glue / Sour Diésel)');
    })
    .addAnswer('Y la cantidad en GR:', { capture: true }, async (ctx, { flowDynamic }) => {
        console.log('Producto recibido:', ctx.body);
        userSteps[ctx.from].product = ctx.body;
        await flowDynamic('Proporciona tu dirección (Apartamento/Torre/Casa):');
    })
    .addAnswer('Proporciona dirección de envío (Apartamento/Torre/Casa):', { capture: true }, async (ctx, { flowDynamic }) => {
        console.log('Dirección recibida:', ctx.body);
        userSteps[ctx.from].address = ctx.body;
        await flowDynamic('Comparte tu ubicación GPS:');
    })
    .addAnswer('Si es complicada envia link de GPS Maps o ubicación:', { capture: true }, async (ctx, { flowDynamic }) => {
        console.log('Ubicación recibida:', ctx.body);
        userSteps[ctx.from].location = ctx.body;
        await flowDynamic('¿Método de pago (NEQUI o DAVIPLATA)?');
    })
    .addAnswer('3156163610', { capture: true }, async (ctx, { flowDynamic }) => {
        console.log('Método de pago recibido:', ctx.body);
        userSteps[ctx.from].paymentMethod = ctx.body;
        await flowDynamic('Proporciona el número de contacto:');
    })
    .addAnswer('Envía el comprobante de pago. Nuestro asesor te contactará pronto.', { capture: true }, (ctx) => {
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
