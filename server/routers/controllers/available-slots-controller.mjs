import models from '../../models/index.mjs';
import { getHolidayDates } from '../../config/holidayUtils.mjs';

const getAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.did;
    const { appointmentDate } = req.query;

    const holidays = await getHolidayDates(
      new Date(appointmentDate).getFullYear()
    );

    if (holidays.includes(appointmentDate)) {
      return res.status(200).json({ slots: [] });
    }

    const availableSlots = await models.available_slots.findOne({
      where: {
        doctorId,
        appointmentDate,
      },
    });

    if (!availableSlots) {
      return res.status(200).json({ slots: [] });
    }

    res.status(200).json(availableSlots);
  } catch (err) {
    next(err);
  }
};

const updateAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.did;
    const { appointmentDate, slots } = req.body;

    const holidays = await getHolidayDates(
      new Date(appointmentDate).getFullYear()
    );
    if (holidays.includes(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Nu se pot adăuga sloturi în zilele de sărbătoare.',
      });
    }

    const [availableSlots, created] = await models.available_slots.upsert(
      { doctorId, appointmentDate, slots },
      {
        returning: true,
      }
    );

    res.status(200).json({
      success: true,
      availableSlots,
    });
  } catch (err) {
    next(err);
  }
};

const clearAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.did;
    const { appointmentDate } = req.body;

    await models.available_slots.destroy({
      where: {
        doctorId,
        appointmentDate,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Slots cleared successfully',
    });
  } catch (err) {
    next(err);
  }
};

const bulkUpdateAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.did;
    const { dateSlots } = req.body;
    const year = new Date().getFullYear();
    const holidays = await getHolidayDates(year);

    const results = await Promise.all(
      dateSlots.map(async ({ date, slots }) => {
        if (holidays.includes(date)) return null;
        const [result] = await models.available_slots.upsert(
          { doctorId, appointmentDate: date, slots },
          { returning: true }
        );
        return result;
      })
    );

    res.status(200).json({
      success: true,
      updatedCount: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAvailableSlots,
  updateAvailableSlots,
  clearAvailableSlots,
  bulkUpdateAvailableSlots,
};
