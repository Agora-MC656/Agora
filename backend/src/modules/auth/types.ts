export interface UserRegistration {
  name: string;
  email: string;
  institution: string;
  age: number;
  gender: string;
  passwordPlain: string;
}

export interface LoginCredentials {
  name_email: string;
  passwordPlain: string;
}