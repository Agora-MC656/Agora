import bcrypt from 'bcrypt';
import { UserRegistration } from './types';

export const registerUser = async (userData: UserRegistration) => {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(userData.passwordPlain, saltRounds);

  // TODO: Insert into the database
  // Conceptual SQL example:
  // await db.query(
  //   'INSERT INTO users (name, institution, age, gender, password) VALUES ($1, $2, $3, $4, $5)',
  //   [userData.name, userData.institution, userData.age, userData.gender, passwordHash],
  // );

  return { success: true, message: 'User registered successfully' };
};