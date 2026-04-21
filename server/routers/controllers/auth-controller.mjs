import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import models from '../../models/index.mjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

const generateToken = (user) => {
  return jwt.sign({ id: user.uuid }, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Te rugăm să completezi toate câmpurile!' });
    }

    const existingUser = await models.user.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email-ul există deja!' });
    }

    const user = await models.user.create({
      username: req.body.username,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      role: 'patient',
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide all the required fields' });
    }

    const user = await models.user.findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    let doctorId = null;
    if (user.role === 'doctor') {
      const doctor = await models.doctor.findOne({
        where: { userId: user.uuid },
      });
      if (doctor) {
        doctorId = doctor.doctorId;
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = generateToken(user);
      res.status(200).json({
        token,
        id: user.uuid,
        username: user.username,
        email: user.email,
        role: user.role,
        doctorId: doctorId,
        profilePicURL: user.profilePicURL,
        profilePicPublicId: user.profilePicPublicId,
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    next(err);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await models.user.findOne({
      where: {
        uuid: userId,
      },
    });
    if (user) {
      res.status(200).json({ message: 'Logout successful' });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    next(err);
  }
};

const requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Emailul este necesar' });

  try {
    const user = await models.user.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email inexistent' });

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000 * 4;

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: 'HappyDent <no-reply@happydent.com>',
      to: user.email,
      subject: 'Resetare parolă',
      text: `Accesează linkul pentru a reseta parola:\n\n${resetLink}`,
    });

    res.json({ message: 'Email de resetare trimis.' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await models.user.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalid sau expirat' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
    res.json({ message: 'Parola a fost schimbată cu succes.' });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.uuid;

  try {
    const user = await models.user.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User inexistent' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Parola actuală este greșită' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Parola a fost actualizată cu succes!' });
  } catch (err) {
    next(err);
  }
};

export default {
  registerUser,
  loginUser,
  generateToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
};
