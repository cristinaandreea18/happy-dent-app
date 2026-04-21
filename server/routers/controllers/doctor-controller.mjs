import models from '../../models/index.mjs';
import PDFDocument from 'pdfkit';

const getPacientList = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'doctor') {
      return res
        .status(403)
        .json({ message: 'Access denied - only doctors can view patients' });
    }

    const patients = await models.user.findAll({
      where: { role: 'patient' },
      attributes: ['uuid', 'username', 'email', 'profilePicURL'],
      include: [
        {
          model: models.users_profile,
          as: 'profile',
          attributes: [
            'firstName',
            'lastName',
            'dateOfBirth',
            'identificationNumber',
            'gender',
            'ocupation',
            'phoneNumber',
            'county',
            'city',
          ],
        },
      ],
    });
    console.log('Patients found:', patients);
    res.status(200).json(patients);
  } catch (err) {
    next(err);
  }
};

const getPacientById = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const pid = req.params.pid;
    if (userRole !== 'doctor') {
      return res
        .status(403)
        .json({ message: 'Access denied - only doctors can view patients' });
    }

    const patient = await models.user.findOne({
      where: { id: pid, role: 'patient' },
      attributes: ['uuid', 'username', 'email'],
      include: [
        {
          model: models.users_profile,
          as: 'profile',
          attributes: [
            'firstName',
            'lastName',
            'dateOfBirth',
            'identificationNumber',
            'gender',
            'ocupation',
            'phoneNumber',
            'county',
            'city',
            'email',
          ],
        },
      ],
    });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found!' });
    }
    res.status(200).json(patient);
  } catch (err) {
    next(err);
  }
};

const getDoctorProfile = async (req, res, next) => {
  const did = req.params.did;
  console.log('Getting doctor profile with ID:', did);
  try {
    const doctorProfile = await models.doctor.findOne({
      where: {
        userId: did,
      },
    });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor not found!' });
    }
    res.status(201).json(doctorProfile);
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const { did } = req.params;

    const doctor = await models.doctor.findOne({
      where: { doctorId: did },
      attributes: [
        'doctorId',
        'firstName',
        'lastName',
        'phone',
        'workingHours',
      ],
      include: [
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
        {
          model: models.user,
          as: 'user',
          attributes: ['email'],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found!' });
    }

    res.status(200).json({
      ...doctor.toJSON(),
      specializations: doctor.specializations.map((s) => s.name),
      competencies: doctor.competencies.map((c) => c.name),
    });
  } catch (err) {
    next(err);
  }
};

const generateTreatmentPdf = async (req, res, next) => {
  try {
    const { patientName, treatmentPlan } = req.body;

    if (!patientName || !Array.isArray(treatmentPlan)) {
      return res.status(400).json({ message: 'Date lipsă sau invalide' });
    }

    const formatDateRO = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Fisa_${patientName.replace(/\s+/g, '_')}.pdf`
    );
    doc.pipe(res);

    doc
      .fontSize(18)
      .text(`Fisa de tratament – ${patientName}`, { align: 'center' });
    doc.moveDown();

    const groupedByDate = {};

    treatmentPlan.forEach((step) => {
      const date = step.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(step);
    });

    Object.entries(groupedByDate).forEach(([date, steps]) => {
      doc
        .fontSize(14)
        .fillColor('black')
        .text(`Data programare: ${formatDateRO(date) || '-'}`, {
          underline: true,
          continued: false,
        })
        .moveDown(0.5);

      const indent = 20;
      const textOptions = { indent, width: 500 };

      steps.forEach((step) => {
        doc
          .fontSize(12)
          .text(`• Categorie: ${step.category || '-'}`, textOptions);
        doc.text(`• Procedura: ${step.procedure || '-'}`, textOptions);
        doc.text(`• Cost: ${step.cost || '-'} lei`, textOptions);
        doc.text(`• Status: ${step.status || '-'}`, textOptions);
        doc.text(`• Dinte: ${step.tooth || '-'}`, textOptions);
        doc.text(
          `• Initiat de: Dr. ${step?.doctor?.firstName || ''} ${
            step?.doctor?.lastName || ''
          }`,
          textOptions
        );
        doc.text(`• Detalii: ${step.details || '-'}`, textOptions);
        doc.moveDown();
      });

      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.end();
  } catch (err) {
    next(err);
  }
};

export default {
  getPacientList,
  getPacientById,
  getDoctorProfile,
  getDoctorById,
  generateTreatmentPdf,
};
