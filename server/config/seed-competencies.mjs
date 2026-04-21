import models from '../models/index.mjs';

const competencies = [
  { code: 'COMP-IMPL01', name: 'Implantologie' },
  { code: 'COMP-END02', name: 'Endodonție' },
  { code: 'COMP-EST03', name: 'Stomatologie Estetică' },
  { code: 'COMP-CHIR04', name: 'Chirurgie Orală' },
  { code: 'COMP-ORT05', name: 'Ortodonție' },
  { code: 'COMP-PAR06', name: 'Parodontologie' },
  { code: 'COMP-PED07', name: 'Pedodonție' },
  { code: 'COMP-PROT08', name: 'Protetica Dentară' },
  { code: 'COMP-RAD09', name: 'Radiologie Dentară' },
  { code: 'COMP-ODON10', name: 'Odontoterapie' },
  { code: 'COMP-PROF11', name: 'Profilaxie' },
];

const seedCompetencies = async () => {
  try {
    for (const { code, name } of competencies) {
      await models.competency.create({ code, name });
    }

    console.log('✅ Competențele au fost inserate cu succes.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare la inserarea competențelor:', err);
    process.exit(1);
  }
};

seedCompetencies();
