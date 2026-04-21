import models from '../../models/index.mjs';
import cloudinary from '../../config/cloudinary.mjs';
import fs from 'fs';
import { Op } from 'sequelize';
import { generateIdWithPrefix } from '../../config/idGenerator.mjs';

const createUserProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      identificationNumber,
      gender,
      ocupation,
      phoneNumber,
      county,
      city,
      email,
    } = req.body;

    if (!req.params.uuid) {
      return res.status(400).json({ message: 'User ID is missing!' });
    }
    if (
      !firstName ||
      !lastName ||
      !identificationNumber ||
      !ocupation ||
      !phoneNumber
    ) {
      return res.status(400).json({
        message: 'Te rugam sa completezi toate campurile obligatorii!',
      });
    }

    if (!dateOfBirth || !gender || !county || !city) {
      return res.status(400).json({
        message: 'Te rugam sa selectezi campurile marcate corespunzator!',
      });
    }

    const existingCnp = await models.users_profile.findOne({
      where: { identificationNumber },
    });

    if (existingCnp) {
      return res.status(409).json({
        field: 'identificationNumber',
        message: 'CNP-ul este deja înregistrat în sistem!',
      });
    }

    const existingPhoneProfile = await models.users_profile.findOne({
      where: { phoneNumber },
    });

    const existingPhoneDoctor = await models.doctor.findOne({
      where: { phone: phoneNumber },
    });

    if (existingPhoneProfile || existingPhoneDoctor) {
      return res.status(409).json({
        field: 'phoneNumber',
        message: 'Numărul de telefon este deja folosit!',
      });
    }

    const profileId = generateIdWithPrefix('UP', 6);

    const profile = await models.users_profile.create({
      profileId,
      userId: req.params.uuid,
      ...req.body,
    });

    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const profile = await models.users_profile.findOne({
      where: {
        userId: req.params.uuid,
      },
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found!' });
    }
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const profile = await models.users_profile.findOne({
      where: { userId: uuid },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const { identificationNumber, phoneNumber } = req.body;

    if (
      identificationNumber &&
      identificationNumber !== profile.identificationNumber
    ) {
      const existingCnp = await models.users_profile.findOne({
        where: {
          identificationNumber,
          userId: { [Op.ne]: uuid },
        },
      });
      if (existingCnp) {
        return res.status(409).json({
          field: 'identificationNumber',
          message: 'CNP-ul este deja înregistrat!',
        });
      }
    }

    if (phoneNumber && phoneNumber !== profile.phoneNumber) {
      const existingPhone = await models.users_profile.findOne({
        where: {
          phoneNumber,
          userId: { [Op.ne]: uuid },
        },
      });
      if (existingPhone) {
        return res.status(409).json({
          field: 'phoneNumber',
          message: 'Numărul de telefon este deja înregistrat!',
        });
      }
    }

    await profile.update(req.body);
    return res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

//user-controller.mjs
const updateUserProfilePic = async (req, res, next) => {
  try {
    const { id } = req.body;
    const file = req.file;

    if (!id || !file) {
      return res.status(400).json({ message: 'Missing user ID or file' });
    }

    const user = await models.user.findOne({ where: { uuid: id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePicPublicId) {
      await cloudinary.uploader.destroy(user.profilePicPublicId);
    }

    const fileName = `user_${id}_profile_pic`;
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'profile_pictures',
      public_id: fileName,
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });

    user.profilePicURL = result.secure_url;
    user.profilePicPublicId = result.public_id;
    await user.save();

    fs.unlink(file.path, () => {});

    res.status(200).json({
      message: 'Profile picture updated',
      user,
    });
  } catch (error) {
    console.error('Error updating profile picture:', error.message);
    next(error);
  }
};

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserProfilePic,
};
