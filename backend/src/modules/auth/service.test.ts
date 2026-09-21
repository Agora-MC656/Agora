import { describe, it, expect } from 'vitest';
import { loginUser, registerUser } from './service.js';

describe('Authentication System - Login', () => {
  
  it('Must reject login of a non-existent user', async () => {
    const credenciais = {
      name_email: 'ghost@unicamp.br',
      passwordPlain: 'password123'
    };

    const resultado = await loginUser(credenciais);
    
    // O Vitest vai "esperar" (expect) que a validação falhe corretamente
    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('User not found');
  });

  it('Must fail when using the wrong password', async () => {
    // 1. Criamos um usuário real para o teste
    await registerUser({
      name: 'Test User',
      email: 'test@unicamp.br',
      institution: 'IC',
      age: 20,
      gender: 'other',
      passwordPlain: 'password123'
    });

    // 2. Tentamos logar com a senha errada
    const resultado = await loginUser({
      name_email: 'test@unicamp.br',
      passwordPlain: 'password456'
    });

    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Invalid password');
  });

  it('Must login with correct credentials', async () => {
    const resultado = await loginUser({
      name_email: 'test@unicamp.br',
      passwordPlain: 'password123'
    });

    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('User logged in successfully');
  });
});