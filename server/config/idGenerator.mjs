import models from '../models/index.mjs';

export const generateIdWithPrefix = (prefix, length = 6) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  for (let i = 0; i < length; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
};

export const generateProfileId = async () => {
  const prefix = 'DOC';
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
