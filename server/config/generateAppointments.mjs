import { v4 as uuidv4 } from 'uuid';
import models from '../models/index.mjs';

const reasons = [
  'Durere dentară acută',
  'Extracție molar',
  'Abces dentar',
  'Infecție gingivală',
  'Gingie inflamată',
  'Durere la mestecat',
  'Sângerare gingivală',
  'Măsea umflată',
  'Consultație pre-extracție',
  'Traumatism dentar',
  'Evaluare pentru măsea de minte',
  'Durere pulsatilă nocturnă',
  'Consultație după traumă dentară',
  'Retratament după extracție incompletă',
  'Consultație post-operatorie',
  'Indicație pentru chirurgie de incluziune',
  'Durere iradiată spre ureche',
  'Apariție fistulă gingivală',
  'Necroză pulpară suspectată',
  'Edem facial apărut peste noapte',
];

const notes = [
  'Durere apărută în ultimele 24h',
  'Pacient cu antecedente de extracții',
  'Necesită evaluare pentru infecție',
  'S-a administrat calmant, fără efect',
  'Solicită extracție urgentă',
  'Umflătură vizibilă la nivelul gingiei',
  'Se suspectează fractură radiculară',
  'Pacient cu teamă de intervenție',
  'Posibil abces periapical',
  'Revenire după infecție tratată',
  'Durerea se accentuează la atingere ușoară',
  'Sângerare spontană apărută în timpul nopții',
  'Pacientul a suferit o lovitură sportivă',
  'Prezență de mobilitate dentară crescută',
  'Pacientul acuză dificultate la masticație',
  'Acuze de gust metalic în cavitatea orală',
  'Pacient diabetic cu istoric de infecții',
  'Posibilă reacție la tratament antibiotic anterior',
  'Zona este sensibilă la rece și cald',
  'Durere de intensitate crescută în timpul nopții',
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateOccupiedSlots = (startTime, duration) => {
  const slots = [];
  const slotCount = duration / 30;
  let [hours, minutes] = startTime.split(':').map(Number);

  for (let i = 0; i < slotCount; i++) {
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}`;
    slots.push(time);
    minutes += 30;
    if (minutes >= 60) {
      minutes -= 60;
      hours += 1;
    }
  }

  return slots;
};

const generateRandomAppointments = async (doctorId, number = 20) => {
  const slotRecords = await models.available_slots.findAll({
    where: { doctorId },
  });
  const patients = await models.user.findAll({ where: { role: 'patient' } });

  if (!patients.length || !slotRecords.length) {
    console.error('Pacienți sau sloturi inexistente.');
    return;
  }

  let count = 0;

  for (const slotRecord of slotRecords) {
    let availableSlots = slotRecord.slots;
    const date = slotRecord.appointmentDate;

    while (availableSlots.length && count < number) {
      const patient = getRandomItem(patients);
      const startTime = getRandomItem(availableSlots);
      const duration = 60;
      const occupiedSlots = generateOccupiedSlots(startTime, duration);

      const isAvailable = occupiedSlots.every((s) =>
        availableSlots.includes(s)
      );
      if (!isAvailable) {
        availableSlots = availableSlots.filter((s) => s !== startTime);
        continue;
      }

      const appointmentId =
        'AP-' + Math.random().toString(36).substr(2, 6).toUpperCase();

      await models.appointment.create({
        appointmentId,
        doctorId,
        patientId: patient.uuid,
        appointmentDate: date,
        time: startTime,
        reason: getRandomItem(reasons),
        note: getRandomItem(notes),
        duration,
      });

      availableSlots = availableSlots.filter((s) => !occupiedSlots.includes(s));
      await slotRecord.update({ slots: JSON.stringify(availableSlots) });

      console.log(
        `${count + 1}. Programare: ${appointmentId} | ${date} la ${startTime}`
      );
      count++;

      if (count >= number) break;
    }

    if (count >= number) break;
  }

  console.log(`Total programări inserate: ${count}`);
};

generateRandomAppointments('DOC-5bPZ9K', 20);
