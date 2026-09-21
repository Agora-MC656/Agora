import { describe, it, expect } from 'vitest';
import { loginUser, registerUser } from './service.js';

describe('Authentication System - Login', () => {
  
  it('Must reject login of a non-existent user', async () => {
    const credenciais = {
      name_email: 'ghost@unicamp.br',
      passwordPlain: 'password123'
    };

    const result = await loginUser(credenciais);
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('User not found');
  });

  it('Must fail when using the wrong password', async () => {
    // Already registred user for testing
    const result = await loginUser({
      name_email: 'test@unicamp.br',
      passwordPlain: 'password456'
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid password');
  });

  it('Must login with correct credentials', async () => {
    const result = await loginUser({
      name_email: 'test@unicamp.br',
      passwordPlain: 'password123'
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('User logged in successfully');
  });
});