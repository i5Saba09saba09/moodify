//login provides popup for user to login, upon submission user is sent to discover page!
/// need token for auth 
///This Login component creates a modal popup 
// that allows users to authenticate and access the app..
//The core functionality lies in the handleLogin 
// function, which processes form submission.
 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';



export default function Login(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    function handleLogin(e) {
        e.preventDefault();
        localStorage.setItem('token', 'logged-in');
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        if (props.toggle) props.toggle();
        navigate('/inspired');
        
    }
    return (
        <div className="popup">
            <div className="popup-inner">
                <h2>Login Below</h2>
                <form onSubmit={handleLogin}>
                    <label>
                        Username:
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </label><br></br>

                    <label>
                        Password:
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </label><br></br><br></br>
                    <button type="submit">submit</button>
                </form>
                <button onClick={props.toggle}>Close</button>
            </div>
        </div>
    );
}