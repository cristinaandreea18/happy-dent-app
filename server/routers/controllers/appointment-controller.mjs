import models from '../../models/index.mjs';
import { sendWhatsAppMessage } from '../../api/sendWhatsAppMessage.mjs';
import { generateIdWithPrefix } from '../../config/idGenerator.mjs'; // ajustează calea

const bookAppointment = async (req, res, next) => {
  try {
    const patientId = req.params.pid;
    const { doctorId, appointmentDate, time, duration, reason, note } =
      req.body;
    console.log('Request body:', req.body);
    console.log('Patient ID from params:', req.params.pid);

    if (!doctorId || !patientId || !appointmentDate || !time) {
      return res.status(400).json({
        message: 'Doctor ID, patient ID, date, and time are required',
      });
    }

    const doctor = await models.doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const patient = await models.user.findByPk(patientId);
    console.log('Patient id:', patientId);
    console.log('Patient found:', patient);
    if (!patient || patient.role !== 'patient') {
      return res
        .status(404)
        .json({ message: 'Patient not found or user is not a patient' });
    }

    const existingAppointment = await models.appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        time,
      },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Slotul a fost deja ocupat' });
    }

    const slot = await models.available_slots.findOne({
      where: {
        doctorId,
        appointmentDate,
      },
    });

    if (!slot || !slot.slots.includes(time)) {
      return res.status(400).json({ message: 'Slotul a fost deja ocupat' });
    }

    const appointmentId = generateIdWithPrefix('AP', 6);

    const newAppointment = await models.appointment.create({
      appointmentId,
      doctorId: doctorId,
      patientId: patientId,
      appointmentDate,
      time,
      duration: duration,
      reason,
      note,
      status: 'in asteptare',
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.aid;

    const appointment = await models.appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'Anulata') {
      return res
        .status(403)
        .json({ message: 'Doar programările anulate pot fi șterse' });
    }

    await appointment.destroy();

    res.status(200).json({
      message: 'Appointment deleted successfully',
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const getAppointmentsByDoctorId = async (req, res, next) => {
  try {
    const doctorId = req.params.did;
    console.log('MA DOARE CAPUL', doctorId);

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    const doctor = await models.doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointments = await models.appointment.findAll({
      where: { doctorId },
      include: [
        {
          model: models.doctor,
          as: 'doctor',
          attributes: ['firstName', 'lastName', 'phone', 'workingHours'],
        },
        {
          model: models.user,
          as: 'patient',
          attributes: ['uuid', 'email', 'role'],
          include: [
            {
              model: models.users_profile,
              as: 'profile',
              attributes: [
                'firstName',
                'lastName',
                'dateOfBirth',
                'gender',
                'phoneNumber',
                'county',
                'city',
              ],
            },
          ],
        },
      ],
      order: [
        ['appointmentDate', 'ASC'],
        ['time', 'ASC'],
      ],
    });

    res.status(200).json({
      appointments,
    });
  } catch (err) {
    next(err);
  }
};

const getAppointmentsByPatientId = async (req, res, next) => {
  try {
    const doctorId = req.params.did;
    console.log('Doctor ID:xxxx', doctorId);
    const patientId = req.params.pid;
    console.log('Patient ID:xxxx', patientId);

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // const patient = await models.user.findByPk(patientId);
    const patient = await models.user.findOne({ where: { uuid: patientId } });

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointments = await models.appointment.findAll({
      where: { patientId: patientId, doctorId },
      include: [
        {
          model: models.doctor,
          as: 'doctor',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [
        ['appointmentDate', 'ASC'],
        ['time', 'ASC'],
      ],
    });

    res.status(200).json({ appointments });
  } catch (err) {
    next(err);
  }
};

const getAllAppointmentsForPatient = async (req, res, next) => {
  try {
    const patientId = req.params.pid;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const patient = await models.user.findOne({ where: { uuid: patientId } });
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointments = await models.appointment.findAll({
      where: { patientId },
      include: [
        {
          model: models.doctor,
          as: 'doctor',
          attributes: ['firstName', 'lastName'],
          include: [
            {
              model: models.specialization,
              attributes: ['code', 'name'],
            },
          ],
        },
      ],
      order: [
        ['appointmentDate', 'ASC'],
        ['time', 'ASC'],
      ],
    });

    res.status(200).json({ appointments });
  } catch (err) {
    next(err);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointmentId = req.params.aid;
    const { newStatus } = req.body;
    console.log(req.body);
    console.log('Ana are mere', appointmentId, newStatus);

    const validStatuses = [
      'In asteptare',
      'Confirmata',
      'Anulata',
      'Finalizata',
    ];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await models.appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = newStatus;
    await appointment.save();

    if (newStatus === 'Confirmata') {
      const fullAppointment = await models.appointment.findByPk(appointmentId, {
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

      const phone = fullAppointment.patient?.profile?.phoneNumber;
      const name = fullAppointment.patient?.profile?.firstName || 'pacient';

      console.log('Pacient:', name);
      console.log('Telefon:', phone);

      const ora = fullAppointment.time;
      const data = new Date(fullAppointment.appointmentDate).toLocaleDateString(
        'ro-RO'
      );

      const mesaj = `Bună, ${name}! Programarea dvs. din ${data} la ora ${ora} a fost confirmată. Vă așteptăm la clinica HappyDent!`;

      try {
        const succes = await sendWhatsAppMessage(name, phone, mesaj);
        if (!succes) {
          console.log(`Mesajul NU a fost trimis către ${name}`);
        }
      } catch (err) {
        console.error('Eroare la trimiterea din controller:', err.message);
      }
    }

    res.status(200).json({
      message: 'Appointment status updated successfully',
      appointment,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const updateAppointmentNote = async (req, res, next) => {
  try {
    const appointmentId = req.params.aid;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const appointment = await models.appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.note = note;
    await appointment.save();

    res.status(200).json({
      message: 'Appointment note updated successfully',
      appointment,
    });
  } catch (err) {
    next(err);
  }
};

const updateAppointmentDuration = async (req, res, next) => {
  try {
    const appointmentId = req.params.aid;
    const { duration } = req.body;

    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }

    const appointment = await models.appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.duration = duration;
    await appointment.save();

    res.status(200).json({
      message: 'Appointment duration updated successfully',
      appointment,
    });
  } catch (err) {
    next(err);
  }
};

const updateAppointmentDateTime = async (req, res, next) => {
  try {
    const appointmentId = req.params.aid;
    const { newDateTime } = req.body;

    if (!newDateTime) {
      return res.status(400).json({ message: 'New datetime is required' });
    }

    const appointment = await models.appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const newDateObj = new Date(newDateTime);
    const newDate = newDateObj.toISOString().split('T')[0];
    const newTime = newDateObj.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

    const existingAppointment = await models.appointment.findOne({
      where: {
        doctorId: appointment.doctorId,
        appointmentDate: newDate,
        time: newTime,
      },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: 'This time slot is already booked' });
    }

    appointment.appointmentDate = newDate;
    appointment.time = newTime;
    await appointment.save();

    res.status(200).json({
      message: 'Appointment date and time updated successfully',
      appointment,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const date = req.query.appointmentDate;

    const doctor = await models.doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const existingAppointments = await models.appointment.findAll({
      where: {
        doctorId,
        date,
      },
      attributes: ['time', 'duration'],
    });

    const workingHours = doctor.workingHours;
    const dayOfWeek = new Date(date).toLocaleString('en-US', {
      weekday: 'long',
    });
    const schedule = workingHours[dayOfWeek];

    if (!schedule || !schedule.enabled) {
      return res.status(200).json({ slots: [] });
    }

    const slots = generateTimeSlots(
      schedule.start,
      schedule.end,
      existingAppointments
    );

    res.status(200).json({ slots });
  } catch (err) {
    next(err);
  }
};

function generateTimeSlots(startTime, endTime, existingAppointments) {
  const slots = [];
  return slots;
}

export default {
  bookAppointment,
  deleteAppointment,
  getAppointmentsByDoctorId,
  getAppointmentsByPatientId,
  getAllAppointmentsForPatient,
  updateAppointmentStatus,
  updateAppointmentNote,
  updateAppointmentDuration,
  updateAppointmentDateTime,
  getAvailableSlots,
};
