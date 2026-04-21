import models from '../../models/index.mjs';

const getAllCompetencies = async (req, res, next) => {
  try {
    const competencies = await models.competency.findAll({
      order: [['name', 'ASC']],
    });
    res.status(200).json({ success: true, data: competencies });
  } catch (err) {
    console.error('Eroare la încărcarea competențelor:', err);
    next(err);
  }
};

export default {
  getAllCompetencies,
};
