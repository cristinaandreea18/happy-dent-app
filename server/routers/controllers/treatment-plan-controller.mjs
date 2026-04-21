import models from '../../models/index.mjs';
import { generateIdWithPrefix } from '../../config/idGenerator.mjs';
import { Op } from 'sequelize';

const saveTreatmentPlan = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { plan, date } = req.body;

  try {
    const userId = req.user.uuid;
    console.log('User ID:', req.user);
    const doctor = await models.doctor.findOne({ where: { userId } });

    if (!doctor) {
      return res
        .status(403)
        .json({ success: false, message: 'Doctorul nu a fost găsit.' });
    }

    const loggedDoctorId = doctor.doctorId;
    console.log('Doctor ID:', loggedDoctorId);

    if (!Array.isArray(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Planul trebuie să fie un array.',
      });
    }

    await models.treatment_plan.destroy({ where: { appointmentId } });

    const newSteps = await models.treatment_plan.bulkCreate(
      plan.map((step) => ({
        stepId: generateIdWithPrefix('SP', 6),
        appointmentId,
        tooth: step.tooth || null,
        status: step.status || 'programat',
        details: step.details || null,
        serviceId: step.serviceId,
        doctorId: loggedDoctorId,
        cost: step.cost,
      }))
    );
    console.log('New treatment steps:', newSteps);

    res.status(200).json({ success: true, date, steps: newSteps });
  } catch (error) {
    console.error('Eroare la salvare plan:', error);
    next(error);
  }
};

const getTreatmentPlan = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { date } = req.query;

  try {
    const steps = await models.treatment_plan.findAll({
      attributes: [
        'stepId',
        'appointmentId',
        'tooth',
        'details',
        'serviceId',
        'cost',
      ],
      include: [
        {
          model: models.appointment,
          as: 'appointment',
          required: true,
          where: {
            appointmentId,
            ...(date && { appointmentDate: date }),
          },
          include: [
            {
              model: models.doctor,
              as: 'doctor',
              include: [
                {
                  model: models.user,
                  as: 'user',
                  include: [
                    {
                      model: models.users_profile,
                      as: 'profile',
                      attributes: ['firstName', 'lastName'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: models.service,
          as: 'service',
          attributes: ['name', 'category', 'price'],
        },
      ],
    });

    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    console.error('Eroare la obținere plan:', error);
    next(error);
  }
};

const getAllTreatmentStepsForPatient = async (req, res, next) => {
  const { patientId } = req.params;

  try {
    const steps = await models.treatment_plan.findAll({
      include: [
        {
          model: models.appointment,
          as: 'appointment',
          where: { patientId },
          required: true,
          include: [
            {
              model: models.doctor,
              as: 'doctor',
              include: [
                {
                  model: models.user,
                  as: 'user',
                  include: [
                    {
                      model: models.users_profile,
                      as: 'profile',
                      attributes: ['firstName', 'lastName'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: models.service,
          as: 'service',
          attributes: ['name', 'category', 'price'],
        },
      ],
      order: [[models.appointment, 'appointmentDate', 'ASC']],
    });

    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    console.error('Eroare la obținere tratamente:', error);
    next(error);
  }
};

const deleteTreatmentStep = async (req, res, next) => {
  const { stepId } = req.params;

  try {
    const deleted = await models.treatment_plan.destroy({
      where: { stepId },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Etapă inexistentă.' });
    }

    res.status(200).json({ success: true, message: 'Etapă ștearsă.' });
  } catch (error) {
    console.error('Eroare la ștergerea etapei:', error);
    next(error);
  }
};

const getMonthlyTreatmentSummaryForDoctor = async (req, res, next) => {
  const { doctorId } = req.params;
  const { year, month } = req.query;

  try {
    const steps = await models.treatment_plan.findAll({
      attributes: ['cost'],
      include: [
        {
          model: models.service,
          as: 'service',
          attributes: ['name', 'category'],
        },
        {
          model: models.appointment,
          as: 'appointment',
          where: {
            doctorId,
            status: 'Finalizata',
            appointmentDate: {
              [Op.between]: [
                new Date(`${year}-${month}-01`),
                new Date(`${year}-${month}-31`),
              ],
            },
          },
          required: true,
        },
      ],
    });

    const summary = {};

    steps.forEach((step) => {
      const category = step.service?.category || 'Necunoscut';
      const procedure = step.service?.name || 'N/A';
      const cost = parseFloat(step.cost) || 0;

      if (!summary[category]) {
        summary[category] = {
          total: 0,
          procedures: {},
        };
      }

      summary[category].total += cost;

      if (!summary[category].procedures[procedure]) {
        summary[category].procedures[procedure] = 0;
      }

      summary[category].procedures[procedure] += cost;
    });

    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error('Eroare la summary:', error);
    next(error);
  }
};

export default {
  saveTreatmentPlan,
  getTreatmentPlan,
  deleteTreatmentStep,
  getAllTreatmentStepsForPatient,
  getMonthlyTreatmentSummaryForDoctor,
};
