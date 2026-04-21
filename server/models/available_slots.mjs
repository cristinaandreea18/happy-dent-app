/**
 * Available Slots model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} doctorId - The doctor's ID (composite primary key part)
 * @property {DATEONLY} appointmentDate - Date for available slots (YYYY-MM-DD format, composite primary key part)
 * @property {string[]} slots - Array of available time slots (HH:MM format), stored as JSON in database
 *
 * @description This model stores doctors' available time slots for specific dates.
 * The slots array is automatically serialized to JSON when stored and parsed when retrieved.
 * The primary key is a composite of doctorId + appointmentDate.
 *
 * @note The slots field has custom getter/setter methods that automatically handle
 * JSON serialization/deserialization of the time slots array.
 */

export default (db, DataTypes) => {
  return db.define(
    'available_slots',
    {
      doctorId: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'doctors',
          key: 'doctorId',
        },
      },
      appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
      },
      slots: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get() {
          const rawValue = this.getDataValue('slots');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue('slots', JSON.stringify(value || []));
        },
      },
    },
    {
      primaryKey: ['doctorId', 'appointmentDate'],
    }
  );
};
