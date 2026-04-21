import models from '../models/index.mjs';

const specializationsData = [
  {
    code: 'CHIR-DA01',
    name: 'Chirurgie dento-alveolară',
    specialties: ['Chirurgie', 'Implantologie'],
  },
  {
    code: 'ORTO-OF02',
    name: 'Ortodonție și ortopedie dento-facială',
    specialties: ['Ortodonție'],
  },
  {
    code: 'ENDO-03',
    name: 'Endodonție',
    specialties: ['Endodonție'],
  },
  {
    code: 'PARO-04',
    name: 'Parodontologie',
    specialties: ['Parodontologie'],
  },
  {
    code: 'PEDO-05',
    name: 'Pedodonție',
    specialties: ['Pedodonție'],
  },
  {
    code: 'PROT-06',
    name: 'Protetică dentară',
    specialties: ['Protetică'],
  },
  {
    code: 'CHIR-SM07',
    name: 'Chirurgie stomatologică și maxilo-facială',
    specialties: ['Chirurgie', 'Implantologie'],
  },
  {
    code: 'STOM-GEN08',
    name: 'Stomatologie generală',
    specialties: ['Odontologie', 'Profilaxie', 'Estetică'],
  },
];

const seedSpecializations = async () => {
  try {
    for (const spec of specializationsData) {
      await models.specialization.create({
        code: spec.code,
        name: spec.name,
        specialties: spec.specialties, // JSON field
      });
    }

    console.log('✅ Toate specializările au fost inserate cu succes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la inserarea specializărilor:', error);
    process.exit(1);
  }
};

seedSpecializations();
