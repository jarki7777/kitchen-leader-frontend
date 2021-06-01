import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogin } from '../../services/fetchLogin';
import { setLogin } from '../../store/actions/authActionCreator';
import ErrorMsg from '../errorMsg/ErrorMsg';
import './Login.sass';

const Login = () => {
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const loginState = useSelector((state) => state.loginState.login);

    const validateLogin = async (event) => {
        event.preventDefault();
        try {
            const email = event.target[0].value;
            const password = event.target[1].value;
            if (!email || !password) throw new Error('All fields are required');

            const res = await fetchLogin(email, password);
            if (res.status === 200) {
                dispatch(setLogin(res));
                setError(null);
            }
            if (res.status === 404) setError('Please verify that the email and password are correct');
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <div className='login-container'>
            <span className='auth-logo'>This is a logo</span>

            <div className='toggle-auth'>
                <div className='active-auth'>Log In</div>
                <div className='inactive-auth'>Sign Up</div>
            </div>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <form className='auth-form' onSubmit={event => validateLogin(event)}>

                <div className='input-field'>
                    <label htmlFor='login-email'>E-mail</label>
                    <input className='input-text' type="email" name="email" id='login-email'></input>
                </div>

                <div className='input-field'>
                    <label htmlFor='login-pw'>Password</label>
                    <input className='input-text' type="password" name="email" id='login-pw'></input>
                </div>

                <button className="login-btn" name="submit" type="submit">Log In</button>

            </form>
        </div>
    );
}

export default Login;