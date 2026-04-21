/**
 * TreatmentPlan model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} stepId - Unique identifier for the treatment step (15 chars max, primary key)
 * @property {string} appointmentId - Reference to the associated appointment (15 chars max)
 * @property {string} [tooth] - Involved tooth number (optional, e.g., "2.6", "1.1")
 * @property {string} [details] - Additional details about the treatment step (optional)
 * @property {'programat'|'în curs'|'finalizat'} status - Treatment step status (default: 'programat')
 * @property {number} serviceId - Reference to the service being performed
 */
export default (db, DataTypes) => {
  return db.define('treatment_plan', {
    stepId: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    appointmentId: {
      type: DataTypes.STRING(15),
      allowNull: false,
      references: {
        model: 'appointments',
        key: 'appointmentId',
      },
    },
    tooth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('programat', 'în curs', 'finalizat'),
      defaultValue: 'programat',
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'serviceId',
      },
    },
  });
};
