/**
 * DoctorCompetency junction model (join table)
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} doctorId - Reference to doctor's ID (15 character max)
 * @property {string} competencyCode - Reference to competency code (15 character max)
 */
export default (db, DataTypes) => {
  return db.define('doctor_competency', {
    doctorId: {
      type: DataTypes.STRING(15),
      references: {
        model: 'doctors',
        key: 'doctorId',
      },
    },
    competencyCode: {
      type: DataTypes.STRING(15),
      references: {
        model: 'competencies',
        key: 'code',
      },
    },
  });
};
