import bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import path from 'path';
import { UserRegistration, LoginCredentials, UserSaved } from './types.js';

// Path to the JSON file that will act as a simple database
const DB_FILE_PATH = path.resolve('users.json'); 

// Auxiliary function to read users from the JSON file
const readUsersFromFile = async (): Promise<UserSaved[]> => {
  try {
    const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users from file:', error);
    return [];
  }
};

// Auxiliary function to save users to the JSON file
const saveDB = async (users: UserSaved[]): Promise<void> => {
  try {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users to file:', error);
  }
};

// Function to register a new user
export const registerUser = async (userData: UserRegistration) => {
  const usersDB = await readUsersFromFile(); // Reads the current users from the JSON file

  const existingUser = usersDB.find(user => user.name === userData.name || user.email === userData.email);
  if (existingUser) {
    throw new Error('User with this name or email already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(userData.passwordPlain, saltRounds);

  if (!userData.name || !userData.institution || !userData.age || !userData.gender || !userData.passwordPlain || !userData.email) {
    throw new Error('All fields are required');
  }

  if (userData.age < 0) {
    throw new Error('Age must be a positive number');
  }

  if (!['male', 'female', 'other'].includes(userData.gender.toLowerCase())) {
    throw new Error('Gender must be male, female, or other');
  }

  if (!userData.email.includes('@')) {
    throw new Error('Invalid email format');
  }

  if (userData.passwordPlain.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const newUser: UserSaved = {
    name: userData.name,
    email: userData.email,
    institution: userData.institution,
    age: userData.age,
    gender: userData.gender,
    passwordHash: passwordHash, // Store the hashed password
  };
  
  usersDB.push(newUser);
  await saveDB(usersDB); // Save the updated users to the JSON file

  return { success: true, message: 'User registered successfully' };
};

export const loginUser = async (credentials: LoginCredentials) => {
  const usersDB = await readUsersFromFile(); // Reads the current users from the JSON file

  // Try to find the user by name or email
  const user = usersDB.find(user => user.name === credentials.name_email || user.email === credentials.name_email);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  // Check if the provided password matches the stored hashed password
  const isMatch = await bcrypt.compare(credentials.passwordPlain, user.passwordHash);
  if (!isMatch) {
    return { success: false, message: 'Invalid password' };
  }

  return { success: true, message: 'User logged in successfully' };
};