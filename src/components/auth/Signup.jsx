import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { Box, Button, Typography } from "@mui/material";
import "./auth.css";
import logo from "../../assets/github-mark-white.svg";
import { Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ← new

  const { setCurrentUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // ← clear previous error
    try {
      setLoading(true);
      const res = await axios.post(
        "http://3.108.191.174:3000/signup",
        {
          email: email,
          password: password,
          username: username,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("userId", res.data.userId);
      setCurrentUser(res.data.userId);
      setLoading(false);
      window.location.href = "/";
    } catch (err) {
      // ← read the message from the server response if available
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-logo-container">
        <img className="logo-login" src={logo} alt="Logo" />
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
          <Box sx={{ padding: 1, textAlign: "center" }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Sign Up
            </Typography>
          </Box>
        </div>

        <div className="login-box">
          {/* ← error message shown inline, not as alert */}
          {error && (
            <Typography
              variant="body2"
              sx={{
                color: "#f44336",
                backgroundColor: "#2a1a1a",
                border: "1px solid #f44336",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "8px",
              }}
            >
              {error}
            </Typography>
          )}

          <div>
            <label className="label">Username</label>
            <input
              autoComplete="off"
              name="Username"
              id="Username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="off"
              name="Email"
              id="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="div">
            <label className="label">Password</label>
            <input
              autoComplete="off"
              name="Password"
              id="Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            variant="contained"
            className="login-btn"
            disabled={loading}
            onClick={handleSignup}
          >
            {loading ? "Loading..." : "Signup"}
          </Button>
        </div>

        <div className="pass-box">
          <p>
            Already have an account? <Link to="/auth">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;