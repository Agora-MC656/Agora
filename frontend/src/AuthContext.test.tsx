import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "./AuthContext";
import { AuthContext } from "./authContextStore";

function Consumer() {
  return (
    <AuthContext.Consumer>
      {(context) =>
        context ? (
          <>
            <span>{context.user?.nameEmail ?? "anônimo"}</span>
            <button onClick={() => context.login("teste@unicamp.br")}>
              Login
            </button>
            <button onClick={context.logout}>Logout</button>
          </>
        ) : null
      }
    </AuthContext.Consumer>
  );
}

describe("AuthContext", () => {
  it("lê o usuário armazenado, realiza login e remove o usuário no logout", () => {
    localStorage.setItem("agora-auth-user", "salvo@unicamp.br");
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByText("salvo@unicamp.br")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(screen.getByText("teste@unicamp.br")).toBeInTheDocument();
    expect(localStorage.getItem("agora-auth-user")).toBe("teste@unicamp.br");

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(screen.getByText("anônimo")).toBeInTheDocument();
    expect(localStorage.getItem("agora-auth-user")).toBeNull();
  });

  it("começa anônimo sem valor armazenado", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByText("anônimo")).toBeInTheDocument();
  });
});
