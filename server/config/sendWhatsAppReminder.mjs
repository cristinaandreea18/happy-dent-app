import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import models from '../models/index.mjs';
import Sequelize from 'sequelize';

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath:
      'C:/Users/crist/Desktop/teme-facultate/an 3/red-licenta/server/config/.wwebjs_auth',
  }),
  puppeteer: { headless: true },
});

client.on('qr', (qr) => {
  console.log('Scanează codul QR cu WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('WhatsApp conectat');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    const appointments = await models.appointment.findAll({
      where: Sequelize.literal(
        'DATE(`appointment`.`appointmentDate`) = CURDATE() + INTERVAL 1 DAY'
      ),
      include: [
        {
          model: models.user,
          as: 'patient',
          include: [
            {
              model: models.users_profile,
              as: 'profile',
              attributes: ['firstName', 'phoneNumber'],
            },
          ],
        },
      ],
    });

    if (!appointments.length) {
      console.log('Nicio programare pentru mâine.');
      // client.destroy();
      return;
    }

    for (const appt of appointments) {
      const name = appt.patient?.profile?.firstName || 'pacient';
      const phone = appt.patient?.profile?.phoneNumber;

      if (!phone) {
        console.log(`Lipsă număr pentru ${name}`);
        continue;
      }

      let cleanedPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');

      if (cleanedPhone.startsWith('0')) {
        cleanedPhone = '40' + cleanedPhone.substring(1);
      }

      if (!/^\d{10,15}$/.test(cleanedPhone)) {
        console.log(
          `Număr invalid pentru ${name}: ${phone} (cleaned: ${cleanedPhone})`
        );
        continue;
      }

      console.log(`Verific număr: ${cleanedPhone} pentru ${name}`);

      try {
        const id = await client.getNumberId(cleanedPhone);

        if (!id) {
          console.log(`Numărul ${cleanedPhone} nu este pe WhatsApp`);
          continue;
        }

        console.log(`Număr valid: ${id._serialized}`);

        const ora = appt.time;
        const mesaj = `Bună ${name}, vă reamintim de programarea de mâine la ora ${ora} la clinica HappyDent.`;

        await client.sendMessage(id._serialized, mesaj);
        console.log(`Mesaj trimis către ${name} (${id._serialized})`);
      } catch (err) {
        console.error(`Eroare la ${name}: ${err.message}`);
        if (err.message.includes('invalid wid')) {
          console.error('Posibilă problemă cu formatul numărului de telefon');
        }
      }
    }
  } catch (err) {
    console.error('Eroare la interogare:', err);
  }
});

client.initialize();
export { client };
