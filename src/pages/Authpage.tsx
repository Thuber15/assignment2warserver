import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";

function Authpage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleRegister() {
    if (!username || !password) {
      setMessage("Please enter a username and password.");
      return;
    }

    try {
      const result = await registerUser({ username, password });
      setMessage(result.message);

      if (result.token) {
        localStorage.setItem("token", result.token);
        navigate("/game");
      }
    } catch {
      setMessage("Register failed.");
    }
  }

  async function handleLogin() {
    if (!username || !password) {
      setMessage("Please enter a username and password.");
      return;
    }

    try {
      const result = await loginUser({ username, password });
      setMessage(result.message);

      if (result.token) {
        localStorage.setItem("token", result.token);
        navigate("/game");
      }
    } catch {
      setMessage("Login failed.");
    }
  }

  return (
    <div>
      <h1>War Game Login</h1>

      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <button onClick={handleRegister}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>

      <p>{message}</p>
    </div>
  );
}

export default Authpage;
