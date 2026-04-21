import Sequelize from 'sequelize';
import { db_username, db_password } from './const.mjs';
import userEntity from './user.mjs';
import userProfileEntity from './users_profile.mjs';
import serviceEntity from './service.mjs';
import doctorEntity from './doctor.mjs';
import appointmentEntity from './appointment.mjs';
import slotsEntity from './available_slots.mjs';
import treatmentEntity from './treatment_plan.mjs';
import specializationEntity from './specialization.mjs';
import competencyEntity from './competency.mjs';

const db = new Sequelize({
  host: 'localhost', //3306
  dialect: 'mysql',
  database: 'happydent_database',
  username: db_username,
  password: db_password,
  logQueryParameters: true,
});

const user = userEntity(db, Sequelize);
const users_profile = userProfileEntity(db, Sequelize);
const service = serviceEntity(db, Sequelize);
const doctor = doctorEntity(db, Sequelize);
const appointment = appointmentEntity(db, Sequelize);
const available_slots = slotsEntity(db, Sequelize);
const treatment_plan = treatmentEntity(db, Sequelize);
const specialization = specializationEntity(db, Sequelize);
const competency = competencyEntity(db, Sequelize);

//user
user.hasOne(users_profile, {
  foreignKey: 'userId',
  as: 'profile',
  onDelete: 'CASCADE',
});
user.hasMany(appointment, { foreignKey: 'patientId', as: 'patient' });

//user_profile
users_profile.belongsTo(user, {
  foreignKey: 'userId',
  as: 'user',
});

//doctor
doctor.belongsTo(user, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  targetKey: 'uuid',
  as: 'user',
});
doctor.hasMany(appointment, { foreignKey: 'doctorId' });
doctor.hasMany(available_slots, {
  foreignKey: 'doctorId',
  as: 'availableSlots',
});
doctor.belongsToMany(specialization, {
  through: 'doctor_specialization',
  foreignKey: 'doctorId',
  otherKey: 'specializationCode',
});
doctor.belongsToMany(competency, {
  through: 'doctor_competency',
  foreignKey: 'doctorId',
  otherKey: 'competencyCode',
});

//appointment
appointment.belongsTo(user, { foreignKey: 'patientId', as: 'patient' });
appointment.belongsTo(doctor, { foreignKey: 'doctorId', as: 'doctor' });
appointment.hasMany(treatment_plan, {
  foreignKey: 'appointmentId',
  as: 'treatmentSteps',
});

//available_slots
available_slots.belongsTo(doctor, {
  foreignKey: 'doctorId',
  as: 'doctor',
});

//treatment_plan
treatment_plan.belongsTo(appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment',
  onDelete: 'CASCADE',
});
treatment_plan.belongsTo(service, {
  foreignKey: 'serviceId',
  as: 'service',
});

//specialization
specialization.belongsToMany(doctor, {
  through: 'doctor_specialization',
  foreignKey: 'specializationCode',
  otherKey: 'doctorId',
});

//competency
competency.belongsToMany(doctor, {
  through: 'doctor_competency',
  foreignKey: 'competencyCode',
  otherKey: 'doctorId',
});

try {
  await db.sync({
    alter: true,
  });
} catch (err) {
  console.warn(err);
}

export default {
  db,
  user,
  users_profile,
  service,
  doctor,
  appointment,
  available_slots,
  treatment_plan,
  specialization,
  competency,
};
