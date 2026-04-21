import models from '../models/index.mjs';

const generateIdWithPrefix = (prefix, length = 6) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  for (let i = 0; i < length; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
};

const generateProfileId = async () => {
  const prefix = 'UP';
  const length = 6;
  let unique = false;
  let id;

  while (!unique) {
    id = generateIdWithPrefix(prefix, length);
    const existing = await models.users_profile.findByPk(id);
    if (!existing) unique = true;
  }

  return id;
};

const updateOldProfileIds = async () => {
  const profiles = await models.users_profile.findAll();

  for (const profile of profiles) {
    if (!profile.profileId || !profile.profileId.startsWith('UP-')) {
      const newId = await generateProfileId();
      profile.profileId = newId;
      await profile.save();
      console.log(`Updated profile ${profile.userId} to ${newId}`);
    }
  }

  console.log('All profileIds updated!');
};

updateOldProfileIds();
