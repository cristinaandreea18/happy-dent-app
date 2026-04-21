// whatsappClient.mjs
import qrcode from 'qrcode-terminal'; // Adaugă această linie
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath:
      'C:/Users/crist/Desktop/teme-facultate/an 3/red-licenta/server/config/.wwebjs_auth',
  }),
  puppeteer: { headless: true },
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true }); // Afișează QR code în consolă
});

client.on('authenticated', () => {
  console.log('Autentificare reușită!');
});

client.on('ready', () => {
  console.log('Client WhatsApp pregătit');
  isClientReady = true;
  readyCallbacks.forEach((cb) => cb());
  readyCallbacks = [];
});

client.initialize();
export default { client, isClientReady };
