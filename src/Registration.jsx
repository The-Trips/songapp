// Registration.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState("");

    const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Pass email to the next page so we know who to attach the username to
                navigate('/create-username', { state: { email: data.email } });
            } else {
                const err = await response.json();
                setApiError(err.detail || "Registration failed");
            }
        } catch (error) {
            setApiError("Network error");
        }
    };

    return (
        <div className="card">
            <h1>Song App</h1>
            <h2>Registration Form</h2>
            {apiError && <p className="error">{apiError}</p>}
            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input type="text" {...register("name", { required: true })} placeholder="Name" />
                {errors.name && <span className="error">Name is mandatory</span>}

                <input type="email" {...register("email", { required: true })} placeholder="Email" />
                {errors.email && <span className="error">Email is mandatory</span>}

                <input type="password" {...register("password", { required: true })} placeholder="Password" />
                {errors.password && <span className="error">Password is mandatory</span>}

                <input type="submit" value="Register" style={{ backgroundColor: "#a1eafb" }} />
            </form>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
}

export default Register;