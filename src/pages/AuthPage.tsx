import { useState } from "react"
import { LoginRequest } from "../redux/api/auth.type"
import { useLoginMutation } from "../redux/api";


export const AuthPage: React.FC = () => {
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    username: "kminchelle",
    password: "0lelplR",
  });
  const [login, {isLoading, error, isError}] = useLoginMutation();

  return (
    <div>
      <h1>Auth Page</h1>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error: {JSON.stringify(error)}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(loginForm);
        }}
      >
        <input
          type="text"
          value={loginForm.username}
          onChange={(e) => {
            setLoginForm({
              ...loginForm,
              username: e.target.value,
            });
          }}
        />
        <input
          type="password"
          value={loginForm.password}
          onChange={(e) => {
            setLoginForm({
              ...loginForm,
              password: e.target.value,
            });
          }}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}