/**
 * Doctor model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} doctorId - Primary key (15 characters)
 * @property {string} userId - Foreign key referencing users.uuid
 * @property {string} firstName - Doctor's first name
 * @property {string} lastName - Doctor's last name
 * @property {string} phone - Doctor's phone number
 * @property {object} workingHours - Doctor's working hours (JSON structure)
 */

export default (db, DataTypes) => {
  return db.define('doctor', {
    doctorId: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    workingHours: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });
};
