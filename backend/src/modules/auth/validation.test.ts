import { describe, expect, it } from 'vitest';
import type { UserRegistration } from './types.js';
import { validateRegistration } from './validation.js';

describe('validateRegistration', () => {
  const baseData: UserRegistration = {
    name: 'Maria Silva',
    email: 'maria@unicamp.br',
    institution: 'UNICAMP',
    age: 22,
    gender: 'female',
    passwordPlain: 'password123',
  };

  const runValidation = (overrides: Partial<UserRegistration> = {}) => {
    return validateRegistration({ ...baseData, ...overrides });
  };

  describe('análise dos limites do tamanho da senha', () => {
    it('rejeita senha com 5 caracteres (imediatamente abaixo do limite mínimo)', () => {
      expect(runValidation({ passwordPlain: '12345' })).toBe(
        'Password must be at least 6 characters long',
      );
    });

    it('aceita senha com 6 caracteres (no limite mínimo)', () => {
      expect(runValidation({ passwordPlain: '123456' })).toBeNull();
    });

    it('aceita senha com 7 caracteres (imediatamente acima do limite mínimo)', () => {
      expect(runValidation({ passwordPlain: '1234567' })).toBeNull();
    });

    it('trata senha vazia como campo obrigatório ausente, em vez de senha curta', () => {
      expect(runValidation({ passwordPlain: '' })).toBe(
        'All fields are required',
      );
    });
  });

  describe('classes de equivalência para os campos de cadastro', () => {
    it.each(['male', 'female', 'other'] as const)(
      'aceita dados de cadastro válidos quando o gênero é "%s"',
      (gender) => {
        expect(runValidation({ gender })).toBeNull();
      },
    );

    it.each([
      { field: 'name', value: '' },
      { field: 'email', value: '' },
      { field: 'institution', value: '' },
      { field: 'age', value: 0 },
      { field: 'gender', value: '' },
      { field: 'passwordPlain', value: '' },
    ] as const)(
      'retorna erro de campos obrigatórios quando $field está vazio ou é zero',
      ({ field, value }) => {
        expect(
          runValidation({ [field]: value } as Partial<UserRegistration>),
        ).toBe('All fields are required');
      },
    );

    it('rejeita idade negativa', () => {
      expect(runValidation({ age: -1 })).toBe('Age must be a positive number');
    });

    it('rejeita gênero fora do conjunto permitido', () => {
      expect(
        runValidation({ gender: 'unknown' as UserRegistration['gender'] }),
      ).toBe('Gender must be male, female, or other');
    });

    it('rejeita e-mail sem o símbolo @', () => {
      expect(runValidation({ email: 'pessoa.unicamp.br' })).toBe(
        'Invalid email format',
      );
    });
  });
});