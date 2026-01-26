// Registration.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = (data) => {
        // Static form - just show a message and navigate
        alert("Registration form submitted (static page - no authentication)");
        navigate('/create-username');
    };

    return (
        <div className="card">
             <h1>Song App</h1>
            <h2>Registration Form</h2>
            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input type="text" {...register("name", { required: true })} placeholder="Name" />
                {errors.name && <span className="error">*Name* is mandatory</span>}

                <input type="email" {...register("email", { required: true })} placeholder="Email" />
                {errors.email && <span className="error">*Email* is mandatory</span>}

                <input type="password" {...register("password", { required: true })} placeholder="Password" />
                {errors.password && <span className="error">*Password* is mandatory</span>}

                <input type="submit" value="Register" style={{ backgroundColor: "#a1eafb" }} />
            </form>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
}

export default Register;