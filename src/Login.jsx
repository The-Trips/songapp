// Login.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Login({ onLogin }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = (data) => {
        // Simulate login success
        if (onLogin) onLogin(); 
        
        // Save dummy email as "user" for now if not set
        if(!localStorage.getItem('app_username')) {
            localStorage.setItem('app_username', data.email.split('@')[0]);
        }
        
        navigate('/'); 
    };

    return (
        <div className="card">
            <h1>Song App</h1>
            <h2>Login Form</h2>
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