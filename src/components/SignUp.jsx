///The core logic resides 
// in the handleSubmit function,
//  which processes form submission. 
// After preventing the default form submission behavior, 
// it performs basic validation by checking 
// if any of the required fields are empty.



import { useState } from "react";
import { useNavigate } from 'react-router-dom';
 

export default function Form(props) {
    // States for registration
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    // States for checking the errors
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(false);
      
    // Handling the name change
    const handleName = (e) => {
        setName(e.target.value);
        setSubmitted(false);
    };
    // Handling the email change
    const handleEmail = (e) => {
        setEmail(e.target.value);
        setSubmitted(false);
    };
    // Handling the password change
    const handlePassword = (e) => {
        setPassword(e.target.value);
        setSubmitted(false);
    };
    // Handling the form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (name === "" || email === "" || password === "") {
            setError(true);
             navigate('/insprired');
        } else {
            setSubmitted(true);
            setError(false);
        }
    };
    // Showing success message
    const successMessage = () => {
        return (
            <div
                className="success"
                style={{
                    display: submitted ? "" : "none",
                }}
            >
                <h1>User {name} successfully registered!!</h1>
            </div>
        );
    };
    // Showing error message if error is true
    const errorMessage = () => {
        return (
            <div
                className="error"
                style={{
                    display: error ? "" : "none",
                }}
            >
                <h1>Please enter all the fields</h1>
            </div>
        );
    };
    return (
        <div className="form">
            <div>
                <h1>User Registration</h1>
            </div>
            {/* Calling to the methods */}
            <div className="messages">
                {errorMessage()}
                {successMessage()}
            </div>
            <form>
                {/* Labels and inputs for form data */}
                <label className="label">Name</label>
                <input
                    onChange={handleName}
                    className="input"
                    value={name}
                    type="text"
                />
                <label className="label">Email</label>
                <input
                    onChange={handleEmail}
                    className="input"
                    value={email}
                    type="email"
                />
                <label className="label">Password</label>
                <input
                    onChange={handlePassword}
                    className="input"
                    value={password}
                    type="password"
                />
                <button onClick={handleSubmit} className="btn" type="submit">Submit</button>
                <button onClick={props.toggle}>Close</button>
            </form>
        </div>
    );
}