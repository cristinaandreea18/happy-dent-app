import models from '../../models/index.mjs';

const getAllServices = async (req, res, next) => {
  try {
    const services = await models.service.findAll({
      order: [
        ['category', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error('Eroare la obținerea serviciilor:', error);
    next(error);
  }
};

export default {
  getAllServices,
};
