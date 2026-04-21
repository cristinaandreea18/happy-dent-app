import models from '../models/index.mjs';

const servicesJSON = {
  CONSULTATIE: [
    { name: 'Consultatie si plan de tratament', price: 150 },
    { name: 'Modele de studiu/arcada', price: 100 },
  ],
  PROFILAXIE: [
    { name: 'Detartraj + Periaj profesional', price: 250 },
    { name: 'Air flow EMS', price: 150 },
    { name: 'Detartraj + Air flow EMS', price: 250 },
    { name: 'Detartraj + Periaj profesional + Air flow EMS', price: 350 },
    { name: 'Fluorizare in gutiera/arcada', price: 300 },
    { name: 'Desensibilizare dinte', price: 100 },
    { name: 'Gutiera bruxism/arcada', price: 300 },
    { name: 'Gutiera bruxism acrilica', price: 800 },
  ],
  TERAPIE: [
    { name: 'Obturatie de colet', price: 200 },
    { name: 'Obturatie compozit fotopolimerizabil o suprafata', price: 250 },
    { name: 'Obturatie compozit fotopolimerizabil doua suprafete', price: 300 },
    { name: 'Obturatie compozit fotopolimerizabil trei suprafete', price: 350 },
    { name: 'Obturatie dinte frontal o suprafata', price: 250 },
    { name: 'Obturatie dinte frontal doua suprafete', price: 300 },
    { name: 'Obturatie dinte frontal trei suprafete', price: 350 },
    { name: 'Obturatie glassionomer', price: 270 },
    { name: 'Incrustatie compozit', price: 700 },
    { name: 'Incrustatie ceramica', price: 1200 },
    { name: 'Incrustatie total metalica', price: 400 },
    { name: 'Incrustatie zirconiu', price: 1000 },
    { name: 'Coafaj direct / indirect', price: 50 },
    { name: 'Obturatie baza CIS', price: 50 },
  ],
  'TRATAMENTUL AFECTIUNILOR PULPARE': [
    { name: 'Pansament calmant', price: 150 },
    { name: 'Drenaj endodontic', price: 150 },
    { name: 'Extirpare vitala dinte monoradicular', price: 200 },
    { name: 'Extirpare vitala dinte pluriradicular', price: 300 },
    { name: 'Obturatie de canal dinte monoradicular', price: 200 },
    { name: 'Obturatie de canal dinte pluriradicular', price: 300 },
    { name: 'Tratament complet dinte biradicular', price: 500 },
  ],
  PARODONTOLOGIE: [
    {
      name: 'Tratament medicamentos gingivite, parodontite/sedinta',
      price: 200,
    },
    { name: 'Chiuretaj parodontal/dinte', price: 100 },
    { name: 'Tratamentul abcesului parodontal', price: 200 },
    { name: 'Detartraj supra/subgingival/dinte', price: 50 },
  ],
  CHIRURGIE: [
    { name: 'Anestezie locala de contact', price: 30 },
    { name: 'Anestezie prin infiltratie', price: 50 },
    { name: 'Drenaj abces', price: 350 },
    { name: 'Extractie dinte monoradicular', price: 250 },
    { name: 'Extractie molar de minte inclus', price: 800 },
    { name: 'Extractie canin inclus', price: 800 },
  ],
  PROTETICA: [
    { name: 'Coroana metalo-ceramica total fizionomica', price: 800 },
    { name: 'Coroana metalo-ceramica semifizionomica', price: 600 },
    { name: 'Coroana ceramica pe suport zirconiu', price: 1300 },
    { name: 'Coroana integral ceramica', price: 1400 },
    { name: 'Coroana metalo-ceramica pe implant', price: 1500 },
    { name: 'Coroana zirconiu pe implant', price: 2000 },
  ],
  ESTETICA: [
    { name: 'Albire dentara la domiciliu (include gutierele)', price: 800 },
    { name: 'Gutiera albire/arcada', price: 250 },
    { name: 'Albire dentara in cabinet /sedinta', price: 700 },
    { name: 'Albire endodontica/dinte/sedinta', price: 200 },
  ],
  PEDODONTIE: [
    {
      name: 'Profilaxie (periaj profesional, instructaj periaj corect)',
      price: 200,
    },
    { name: 'Extractie dinte temporar', price: 100 },
    { name: 'Extractie dinte temporar cu radacini neresorbite', price: 200 },
  ],
  ORTODONTIE: [
    { name: 'Consultatie medic specialist ortodont', price: 150 },
    { name: 'Modele de studiu', price: 300 },
    { name: 'Fotografii diagnostice (intraorale si extraorale)', price: 100 },
    { name: 'Stripping/dinte', price: 20 },
    { name: 'Disjunctor', price: 1700 },
    { name: 'Aparat ortodontic mobil', price: 1500 },
    { name: 'Aparat ortodontic fix, metalic/arcada', price: 2000 },
    { name: 'Aparat ortodontic fix, ceramic/arcada', price: 3000 },
  ],
  IMPLANTOLOGIE: [
    { name: 'Implant dentar', price: 2500 },
    { name: 'Lifting de sinus extern', price: 4000 },
    { name: 'Lifting de sinus intern', price: 2500 },
    { name: 'Aditie Bio-Os 1g', price: 1500 },
  ],
};

const seedServices = async () => {
  try {
    for (const [category, services] of Object.entries(servicesJSON)) {
      for (const { name, price } of services) {
        await models.service.create({ category, name, price });
      }
    }

    console.log('✅ Toate serviciile au fost inserate cu succes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la inserare:', error);
    process.exit(1);
  }
};

seedServices();
