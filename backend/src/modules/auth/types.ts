export interface UserRegistration {
  name: string;
  institution: string;
  age: number;
  gender: string;
  passwordPlain: string;
}

export interface LoginCredentials {
  name: string;
  passwordPlain: string;
}