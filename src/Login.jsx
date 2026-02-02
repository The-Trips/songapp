// Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Login({ onLogin }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState("");

    const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                if (result.status === "incomplete") {
                    // User exists but has no username yet
                    navigate('/create-username', { state: { email: result.email } });
                } else {
                    // Success
                    localStorage.setItem('app_username', result.username);
                    if (onLogin) onLogin();
                    navigate('/');
                }
            } else {
                setLoginError(result.detail || "Login failed");
            }
        } catch (error) {
            setLoginError("Network error");
        }
    };

    return (
        <div className="card">
            <h1>Song App</h1>
            <h2>Login Form</h2>
            {loginError && <p className="error">{loginError}</p>}
            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input type="email" {...register("email", { required: true })} placeholder="Email" />
                {errors.email && <span className="error">Required</span>}

                <input type="password" {...register("password", { required: true })} placeholder="Password" />
                {errors.password && <span className="error">Required</span>}

                <input type="submit" value="Login" style={{ backgroundColor: "#a1eafb" }} />
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
}

export default Login;