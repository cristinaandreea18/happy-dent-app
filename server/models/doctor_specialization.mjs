/**
 * DoctorSpecialization junction model (Many-to-Many relationship)
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} doctorId - Foreign key referencing doctors.doctorId (15 chars max)
 * @property {string} specializationCode - Foreign key referencing specializations.code (15 chars max)
 */
export default (db, DataTypes) => {
  return db.define('doctor_specialization', {
    doctorId: {
      type: DataTypes.STRING(15),
      references: {
        model: 'doctors',
        key: 'doctorId',
      },
    },
    specializationCode: {
      type: DataTypes.STRING(15),
      references: {
        model: 'specializations',
        key: 'code',
      },
    },
  });
};
