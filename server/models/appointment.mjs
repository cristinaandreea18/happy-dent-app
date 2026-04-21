/**
 * Appointment model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} appointmentId - Primary key (15 characters)
 * @property {string} doctorId - Foreign key referencing doctors.doctorId
 * @property {string} patientId - Foreign key referencing users.uuid (validated as patient role)
 * @property {Date} appointmentDate - Date of the appointment (DATEONLY format)
 * @property {string} time - Time of the appointment
 * @property {string} reason - Reason for the appointment
 * @property {string} note - Additional notes about the appointment
 * @property {'Pending'|'Confirmed'|'Cancelled'|'Completed'} status - Appointment status (enum with default 'Pending')
 * @property {number} [duration=30] - Duration of appointment in minutes (default: 30)
 */

export default (db, DataTypes) => {
  return db.define('appointment', {
    appointmentId: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.STRING(15),
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'doctorId',
      },
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
      validate: {
        async isPatient(value) {
          const user = await db.models.user.findByPk(value);
          if (!user || user.role !== 'patient') {
            throw new Error('Selected user is not a patient');
          }
        },
      },
    },
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'In asteptare',
        'Confirmata',
        'Anulata',
        'Finalizata'
      ),
      defaultValue: 'In asteptare',
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
  });
};
