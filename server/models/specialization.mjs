/**
 * Specialization model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} code - Unique specialization code (15 chars max, primary key) (e.g., "CHIR-DA01")
 * @property {string} name - Full name of the specialization (e.g., "Dento-alveolar Surgery")
 * @property {string[]} specialties - Array of included specialties/competencies (e.g., ["Surgery", "Implantology"])
 */
export default (db, DataTypes) => {
  return db.define('specialization', {
    code: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialties: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });
};
