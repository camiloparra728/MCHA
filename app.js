const venom = require('venom-bot');

// git add .
// git commit -m "Initial commit"

// git push -u origin main
// git push heroku main   
// heroku logs --tail


// Crear el primer chatbot para "Marca"
const fs = require('fs');

const path = require('path');

// Función para manejar la carga o creación de una sesión
const createOrLoadSession = async (sessionName, handleMessage) => {
  const sessionPath = path.join(__dirname, `${sessionName}-session.json`);

  // Verifica si ya existe una sesión guardada
  if (fs.existsSync(sessionPath)) {
    const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

    // Carga la sesión existente
    venom.create(sessionName, (base64Qr, asciiQR, attempt, urlCode) => {
       console.log(`QR Code para la sesión ${sessionName}:`, base64Qr);
    }, (statusSession) => {
      // console.log(`Estado de la sesión ${sessionName}:`, statusSession);
    }, { session: sessionData })
    .then(client => {
      startClubFlorBot(client)
    })
    .catch(error => {
      console.error(`Error al cargar la sesión ${sessionName}:`, error);
    });
  } else {

    
venom
.create(
  {
    session: sessionName, // Nombre de la sesión
    multidevice: true, // Si quieres habilitar el modo multidispositivo
    headless: true, // Para evitar que abra una ventana del navegador
    folderNameToken: 'tokens', // Directorio donde se guardarán los tokens 
  },
  (base64Qr, asciiQR, attempt, urlCode) => {
    console.log(`QR Code para la sesión ${sessionName}:`, base64Qr);
  }, (statusSession) => {
    //console.log(`Estado de la sesión1 ${sessionName}:`, statusSession);
  },
  undefined,
  { logQR: false } // Desactiva el log para no mostrar el QR en consola si no lo necesitas
  
)
.then((client) => startClubFlorBot(client))
.catch((error) => {
  console.log('Error al iniciar el primer bot:', error);
});
   
  }
};



// Crear o cargar las sesiones para los dos chatbots
createOrLoadSession('clubflor-session1');
createOrLoadSession('clubflor-session2');


  

// Estado de los usuarios para el chatbot interactivo
let userSteps = {};
// Función para manejar el segundo chatbot (Club flor)
function startClubFlorBot(client) {

 
client.onStateChange((state) => {
    if (state === 'CONNECTED') {
        //console.log('Conectado exitosamente!');
    }
});

client.on('session:save', (session) => {
  console.log(`Sesión guardada:`, session);
  fs.writeFileSync(`${session.sessionName}-session.json`, JSON.stringify(session));
});

  client.onMessage(async (message) => {
    const user = message.from;

    // Inicializar los pasos del usuario si es la primera vez que interactúa
    if (!userSteps[user]) {
      userSteps[user] = { step: 1 };
    }

    const currentStep = userSteps[user].step;

    // Paso 1: Solicitar nombre
    if (currentStep === 1) {
      await client.sendText(user, 'Por favor, indica el nombre de quien recibe:');
      userSteps[user].step = 2;

    // Paso 2: Solicitar tipo de producto y cantidad
    } else if (currentStep === 2) {
      userSteps[user].name = message.body; // Guardar el nombre del cliente
      await client.sendText(user, 'Elige el tipo de producto (Amnesia / Gorila Glue / Sour Diésel) y la cantidad en GR:');
      userSteps[user].step = 3;

    // Paso 3: Solicitar dirección
    } else if (currentStep === 3) {
      userSteps[user].product = message.body; // Guardar el producto y la cantidad
      await client.sendText(user, 'Por favor, indica la dirección (Apartamento/Torre/Casa):');
      userSteps[user].step = 4;

    // Paso 4: Solicitar ubicación GPS
    } else if (currentStep === 4) {
      userSteps[user].address = message.body; // Guardar la dirección
      await client.sendText(user, 'Por favor, comparte tu ubicación GPS del domi 📍:');
      userSteps[user].step = 5;

    // Paso 5: Solicitar método de pago
    } else if (currentStep === 5) {
      userSteps[user].location = message.body; // Guardar la ubicación GPS
      await client.sendText(user, '¿Cuál es tu método de pago (NEQUI o DAVIPLATA)?:');
      userSteps[user].step = 6;

    // Paso 6: Solicitar el número de contacto
    } else if (currentStep === 6) {
      userSteps[user].paymentMethod = message.body; // Guardar el método de pago
      await client.sendText(user, 'Por favor, proporciona el número de contacto:');
      userSteps[user].step = 7;

    // Paso 7: Solicitar comprobante de pago
    } else if (currentStep === 7) {
      userSteps[user].contactNumber = message.body; // Guardar el número de contacto
      await client.sendText(user, 'Envía el comprobante de pago. En breve, nuestro asesor te contactará para finalizar el proceso.');
      userSteps[user].step = 8;

    // Final: Confirmación y finalización
    } else if (currentStep === 8) {
      await client.sendText(user, '¡Gracias! Hemos recibido tus datos y el comprobante. Un asesor se pondrá en contacto contigo pronto.');
      // Resetear el estado del usuario para futuros pedidos
      userSteps[user] = { step: 1 };
    }
  });
}
