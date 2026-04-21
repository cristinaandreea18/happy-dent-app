import models from '../../models/index.mjs';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { generateIdWithPrefix } from '../../config/idGenerator.mjs'; // ajustează calea

const mapSpecializationsToCodes = async (names) => {
  const specs = await models.specialization.findAll({
    where: {
      name: {
        [Op.in]: names,
      },
    },
    attributes: ['code', 'name'],
  });

  const map = {};
  specs.forEach((s) => {
    map[s.name] = s.code;
  });

  return names.map((n) => map[n]).filter(Boolean);
};

const mapCompetenciesToCodes = async (names) => {
  const comps = await models.competency.findAll({
    where: {
      name: {
        [Op.in]: names,
      },
    },
    attributes: ['code', 'name'],
  });

  const map = {};
  comps.forEach((c) => {
    map[c.name] = c.code;
  });

  return names.map((n) => map[n]).filter(Boolean);
};

const getAdminProfile = async (req, res, next) => {
  const adminId = req.params.aid;
  console.log('Getting admin profile with ID:', adminId);
  try {
    const adminProfile = await models.users_profile.findOne({
      where: {
        userId: adminId,
      },
    });
    if (!adminProfile) {
      return res.status(404).json({ message: 'Admin not found!' });
    }
    res.status(201).json(adminProfile);
  } catch (err) {
    next(err);
  }
};

const addDoctor = async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    const {
      firstName,
      lastName,
      email,
      phone,
      specializations,
      competencies,
      workingHours,
    } = req.body.doctorData;

    const existingDoctorUser = await models.user.findOne({
      where: { email },
    });

    if (existingDoctorUser) {
      return res
        .status(400)
        .json({ message: 'Emailul este deja inregistrat!' });
    }

    const existingPhoneDoctor = await models.doctor.findOne({
      where: { phone },
    });

    const existingPhoneProfile = await models.users_profile.findOne({
      where: { phoneNumber: phone },
    });

    if (existingPhoneDoctor || existingPhoneProfile) {
      return res.status(400).json({
        field: 'phone',
        message: 'Numărul de telefon este deja folosit în sistem!',
      });
    }

    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.doc`;
    const tempPassword = 'Doctor!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await models.user.create({
      username,
      email,
      password: hashedPassword,
      role: 'doctor',
    });

    const doctorId = generateIdWithPrefix('DOC', 6);

    const doctorProfile = await models.doctor.create({
      doctorId,
      firstName,
      lastName,
      email,
      phone,
      userId: newUser.uuid,
      workingHours,
    });

    const specCodes = await mapSpecializationsToCodes(specializations);
    const compCodes = await mapCompetenciesToCodes(competencies);

    await doctorProfile.setSpecializations(specCodes);
    await doctorProfile.setCompetencies(compCodes);

    res.status(201).json({
      message: 'Doctor added successfully!',
      user: {
        id: newUser.id,
        username,
        email,
        role: 'doctor',
      },
      profile: doctorProfile,
      tempPassword,
    });
  } catch (err) {
    next(err);
  }
};

const getDoctorsList = async (req, res, next) => {
  try {
    const doctors = await models.doctor.findAll({
      include: [
        {
          model: models.user,
          as: 'user',
          attributes: ['uuid', 'username', 'email', 'profilePicURL'],
        },
        {
          model: models.specialization,
          attributes: ['code', 'name'],
          through: { attributes: [] },
        },
        {
          model: models.competency,
          attributes: ['code', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    const formattedDoctors = doctors.map((doc) => ({
      ...doc.toJSON(),
      specializations: doc.specializations.map((s) => s.name),
      competencies: doc.competencies.map((c) => c.name),
    }));

    res.status(200).json(formattedDoctors);
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      specializations,
      competencies,
      workingHours,
    } = req.body;

    const doctor = await models.doctor.findByPk(id, {
      include: [
        {
          model: models.user,
          as: 'user',
          attributes: ['uuid', 'email'],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    if (email && email !== doctor.user?.email) {
      const existingUser = await models.user.findOne({
        where: {
          email,
          uuid: { [Op.ne]: doctor.user.uuid },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          field: 'email',
          message: 'Emailul este deja folosit de alt cont!',
        });
      }

      await doctor.user.update({ email });
    }

    if (phone && phone !== doctor.phone) {
      const existingDoctorPhone = await models.doctor.findOne({
        where: {
          phone,
          doctorId: { [Op.ne]: doctor.doctorId },
        },
      });

      const existingUserPhone = await models.users_profile.findOne({
        where: {
          phoneNumber: phone,
          userId: { [Op.ne]: doctor.user.uuid },
        },
      });

      if (existingDoctorPhone || existingUserPhone) {
        return res.status(409).json({
          field: 'phone',
          message: 'Numărul de telefon este deja folosit în sistem!',
        });
      }
    }

    await doctor.update({ firstName, lastName, phone, workingHours });

    const specCodes = await mapSpecializationsToCodes(specializations);
    const compCodes = await mapCompetenciesToCodes(competencies);

    await doctor.setSpecializations(specCodes);
    await doctor.setCompetencies(compCodes);

    res.status(200).json(doctor);
  } catch (err) {
    next(err);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await models.doctor.findOne({
      where: { doctorId: id },
      include: [
        {
          model: models.user,
          as: 'user',
        },
      ],
    });
    console.log('Doctor found:', doctor);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.user) {
      return res
        .status(400)
        .json({ message: 'Associated user account not found' });
    }

    await models.user.destroy({
      where: { uuid: doctor.user.uuid },
    });

    await doctor.destroy();
    res.status(200).json({
      message: 'Doctor and associated user account deleted successfully',
      deletedDoctorId: doctor.doctorId,
      deletedUserId: doctor.user.uuid,
    });
  } catch (err) {
    next(err);
  }
};

const getMonthlyReportByDoctor = async (req, res, next) => {
  try {
    const { doctorId, year, month } = req.query;
    console.log('doctorId:', doctorId, 'year:', year, 'month:', month);

    if (!doctorId || !year || !month) {
      return res
        .status(400)
        .json({ message: 'doctorId, year, and month are required' });
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const appointments = await models.appointment.findAll({
      where: {
        doctorId,
        appointmentDate: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      attributes: ['appointmentDate', 'status'],
      order: [['appointmentDate', 'ASC']],
    });

    const grouped = {};
    appointments.forEach((appt) => {
      const dateStr = new Date(appt.appointmentDate)
        .toISOString()
        .split('T')[0];
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          total: 0,
          completed: 0,
          cancelled: 0,
          pending: 0,
          confirmed: 0,
        };
      }
      grouped[dateStr].total += 1;
      if (appt.status === 'Finalizata') grouped[dateStr].completed += 1;
      if (appt.status === 'Anulata') grouped[dateStr].cancelled += 1;
      if (appt.status === 'In asteptare') grouped[dateStr].pending += 1;
      if (appt.status === 'Confirmata') grouped[dateStr].confirmed += 1;
    });

    const result = Object.keys(grouped).map((date) => ({
      date,
      ...grouped[date],
    }));

    const doctor = await models.doctor.findByPk(doctorId, {
      attributes: ['doctorId', 'firstName', 'lastName'],
    });

    res.status(200).json({
      doctorId: doctor.doctorId,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      appointmentsByDay: result,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAdminProfile,
  addDoctor,
  getDoctorsList,
  updateDoctor,
  deleteDoctor,
  getMonthlyReportByDoctor,
};
