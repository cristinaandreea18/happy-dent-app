/**
 * Service model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {number} serviceId - Auto-incremented primary key
 * @property {string} category - Service category (e.g., 'Dental', 'Medical')
 * @property {string} name - Name of the service (e.g., 'Teeth Whitening')
 * @property {number} price - Service price (DECIMAL(10,2) format)
 */
export default (db, DataTypes) => {
  return db.define('service', {
    serviceId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });
};
