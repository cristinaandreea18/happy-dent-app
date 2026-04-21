import models from '../models/index.mjs';
import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Unauthorized-no token provided' });
    }

    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await models.user.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Unathorized-user not found' });
    }
    req.user = user;
    console.log('User role', user.role);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized-token is not valid' });
  }
};

export default verifyToken;
