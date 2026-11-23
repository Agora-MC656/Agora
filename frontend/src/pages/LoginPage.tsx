import { useState, type FormEvent } from "react";

import { useAuth } from "../useAuth";
import { ApiError, authApi } from "../services/api";

type Mode = "login" | "register";

export default function LoginPage() {
  const { user, login, logout } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [nameEmail, setNameEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setFieldErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (user) {
      setError(
        "Você já está logado. Saia da conta atual antes de entrar em outra.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    try {
      if (mode === "login") {
        const result = await authApi.login({
          name_email: nameEmail,
          passwordPlain: password,
        });
        if (!result.success) {
          throw new Error(result.message);
        }
        login(nameEmail);
        setSuccess(result.message);
      } else {
        const numericAge = Number(age);
        if (!Number.isInteger(numericAge) || numericAge < 1) {
          setFieldErrors({ age: "Informe uma idade válida maior que zero." });
          return;
        }
        if (!email.includes("@")) {
          setFieldErrors({ email: "Informe um e-mail válido." });
          return;
        }
        if (password.length < 6) {
          setFieldErrors({
            password: "A senha deve ter pelo menos 6 caracteres.",
          });
          return;
        }
        const result = await authApi.register({
          name,
          email,
          institution,
          age: numericAge,
          gender,
          passwordPlain: password,
        });
        setSuccess(result.message);
        setPassword("");
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        setError(
          `Servidor indisponível: o backend não está acessível em http://localhost:3000. ` +
            `Na raiz do projeto, execute "npm run dev" e tente novamente.`,
        );
        return;
      }

      if (cause instanceof ApiError && cause.status === 502) {
        setError(
          "Não foi possível alcançar o backend. Verifique se ele está em execução e tente novamente.",
        );
        return;
      }

      if (cause instanceof ApiError && cause.status === 429) {
        setError(
          "Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.",
        );
        return;
      }

      if (cause instanceof ApiError && cause.status === 400) {
        setError("Informe o nome ou e-mail e a senha.");
        return;
      }

      if (cause instanceof ApiError && cause.status === 500) {
        setError("Não foi possível processar o login. Tente novamente.");
        return;
      }

      const message =
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir a operação.";
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("nome, e-mail ou senha")) {
        setError(message);
      } else if (
        lowerMessage.includes("e-mail") ||
        lowerMessage.includes("email")
      ) {
        setFieldErrors((current) => ({ ...current, email: message }));
      } else if (lowerMessage.includes("senha")) {
        setFieldErrors((current) => ({ ...current, password: message }));
      } else if (
        lowerMessage.includes("gender") ||
        lowerMessage.includes("gênero")
      ) {
        setFieldErrors((current) => ({ ...current, gender: message }));
      } else if (lowerMessage.includes("nome")) {
        setFieldErrors((current) => ({ ...current, name: message }));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      {user ? (
        <>
          <h1>Conta já conectada</h1>
          <p>
            Você está conectado como <strong>{user.nameEmail}</strong>. Para
            entrar em outra conta, primeiro saia da conta atual.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              logout();
              setError("");
              setSuccess("");
              setFieldErrors({});
            }}
          >
            Sair da conta atual
          </button>
          {success && (
            <p className="feedback success" role="status">
              {success}
            </p>
          )}
        </>
      ) : (
        <>
          <h1>{mode === "login" ? "Entrar no Ágora" : "Criar conta"}</h1>
          <div
            className="auth-tabs"
            role="tablist"
            aria-label="Modo de autenticação"
          >
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => changeMode("login")}
            >
              Entrar
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => changeMode("register")}
            >
              Cadastrar
            </button>
          </div>

          <form
            className="form-grid"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            {mode === "login" ? (
              <>
                <label>
                  Nome ou e-mail
                  <input
                    value={nameEmail}
                    onChange={(event) => setNameEmail(event.target.value)}
                    required
                    autoComplete="username"
                  />
                  {fieldErrors.nameEmail && (
                    <span className="field-error">{fieldErrors.nameEmail}</span>
                  )}
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  {fieldErrors.password && (
                    <span className="field-error">{fieldErrors.password}</span>
                  )}
                </label>
              </>
            ) : (
              <>
                <label>
                  Nome
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                  {fieldErrors.name && (
                    <span className="field-error">{fieldErrors.name}</span>
                  )}
                </label>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                  />
                  {fieldErrors.email && (
                    <span className="field-error">{fieldErrors.email}</span>
                  )}
                </label>
                <label>
                  Instituição
                  <input
                    value={institution}
                    onChange={(event) => setInstitution(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Idade
                  <input
                    type="number"
                    min="1"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    required
                  />
                  {fieldErrors.age && (
                    <span className="field-error">{fieldErrors.age}</span>
                  )}
                </label>
                <label>
                  Gênero
                  <select
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                  {fieldErrors.gender && (
                    <span className="field-error">{fieldErrors.gender}</span>
                  )}
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  {fieldErrors.password && (
                    <span className="field-error">{fieldErrors.password}</span>
                  )}
                </label>
              </>
            )}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading
                ? "Processando..."
                : mode === "login"
                  ? "Entrar"
                  : "Cadastrar"}
            </button>
          </form>

          {error && (
            <p className="feedback error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="feedback success" role="status">
              {success}
            </p>
          )}
        </>
      )}
    </section>
  );
}
