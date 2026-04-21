/**
 * Competency model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} code - Unique competency code (e.g. "1") (15 character max, primary key)
 * @property {string} name - Name of the competency (e.g. "Implantology")
 *
 * @description Represents a medical competency/specialization that can be assigned to doctors.
 * The model uses a short code as its primary key and includes a descriptive name.
 */
export default (db, DataTypes) => {
  return db.define('competency', {
    code: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
