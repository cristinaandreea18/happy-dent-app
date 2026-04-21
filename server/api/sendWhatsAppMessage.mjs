import { client } from '../config/sendWhatsAppReminder.mjs'; // Importă clientul deja conectat

export const sendWhatsAppMessage = async (name, rawPhone, messageText) => {
  try {
    // Curăță numărul de telefon
    let cleaned = rawPhone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '40' + cleaned.substring(1);

    console.log(`Încerc să trimit mesaj la ${cleaned}...`);

    // Verifică dacă clientul e gata
    // if (!client.pupPage) {
    //   throw new Error('WhatsApp nu este conectat încă!');
    // }

    // Verifică dacă numărul e pe WhatsApp
    const id = await client.getNumberId(cleaned);
    console.log(`ID pentru ${cleaned}:`, id?._serialized || 'N/A');
    if (!id) {
      console.log(`Numărul ${cleaned} nu e pe WhatsApp.`);
      return false;
    }

    // Trimite mesajul
    await client.sendMessage(id._serialized, messageText);
    console.log(`Mesaj trimis la ${name} (${cleaned})`);
    return true;
  } catch (err) {
    console.error('Eroare la trimitere:', err.message);
    throw err;
  }
};
