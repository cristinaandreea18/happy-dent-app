import models from '../../models/index.mjs';

const getAllSpecializations = async (req, res, next) => {
  try {
    const specializations = await models.specialization.findAll({
      order: [['name', 'ASC']],
    });

    res.status(200).json({ success: true, data: specializations });
  } catch (error) {
    console.error('Eroare la obținerea specializărilor:', error);
    next(error);
  }
};

export default {
  getAllSpecializations,
};
