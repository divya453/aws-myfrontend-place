import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance"; 
import { useAuth } from "../../authContext";
import { Box, Button, Typography } from "@mui/material";
import "./auth.css";
import logo from "../../assets/github-mark-white.svg";
import { Link } from "react-router-dom";

const Login = () => {
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    localStorage.removeItem("userId");
    setCurrentUser(null);
  }, [setCurrentUser]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("userId", res.data.userId);
      setCurrentUser(res.data.userId);
      setLoading(false);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Login Failed!");
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
              Sign In
            </Typography>
          </Box>
        </div>

        <div className="login-box">
          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="off"
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
            onClick={handleLogin}
          >
            {loading ? "Loading..." : "Login"}
          </Button>
        </div>

        <div className="pass-box">
          <p>
            New to GitHub? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;