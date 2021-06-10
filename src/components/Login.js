import React, {useEffect, useState} from 'react';
import '../styles/Login.css';
import {Backdrop, CircularProgress, Fade, TextField} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
import {makeStyles} from '@material-ui/core/styles';
import {getConfig} from "../Helpers";
import {Alert} from "@material-ui/lab";
import {BASE_URL, VERSION} from "../Constants";
import {clearToken, getToken, storeToken} from "../StorageHelper";
import logo from '../assets/images/logo.png';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

export default function Login(props) {

    const {errorCase} = useParams();

    const errorMessages = {
        "incorrectRole": "Only admins and users can access to our web app.",
        "notLoggedIn": "You are not logged in.",
        "invalidToken": "Invalid token."
    };

    const classes = useStyles();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setLoggingIn] = useState(false);
    const [isValidatingToken, setValidatingToken] = useState(false);
    const [loginError, setLoginError] = useState();

    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (errorCase) {
            setLoginError(errorMessages[errorCase]);

            if (errorCase === "invalidToken") {
                logoutToClearSession();
            }
        }

        const token = getToken();
        if (token) {
            setValidatingToken(true);
            axios.get(BASE_URL, getConfig())
                .then((response) => {
                    // Redirect to main route
                    history.push("/main");
                })
                .catch((error) => {
                    setValidatingToken(false);

                    // TODO: Make sure the response is Unauthorized
                    clearToken();
                });
        }
    }, []);

    const doLogin = async e => {
        e.preventDefault();

        // Check if username or password is empty
        if (username.trim() === '' || password.trim() === '') {
            // TODO: Display error on UI
            console.log("Empty credentials");
            return false;
        }

        // Display the loading animation
        setLoggingIn(true);

        axios.post(`${BASE_URL}auth/token/`, {
            username : username,
            password : password
        }).then((response) => {
            // Store token in local storage
            storeToken(response.data.token);

            // Android web interface
            if (window.AndroidWebInterface) {
                window.AndroidWebInterface.registerUserToken(response.data.token ?? "");
            }

            // Redirect to main route
            history.push((location.nextPath ?? "/main") + (location.search ?? ""));
        }).catch((error) => {

            // Hide the loading animation
            setLoggingIn(false);
            setLoginError(undefined);

            // Handle the error
            if (error.response) {
                // Request made and server responded
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);

                setLoginError("Incorrect username or password.");
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);

                setLoginError("An error has occurred.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);

                setLoginError("An error has occurred.");
            }
        })
    }

    const logoutToClearSession = () => {
        axios.get( `${BASE_URL}auth/logout/`, getConfig())
            .then((response) => {
                console.log("Logout: ", response.data);

            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <div className="login">

            <Fade in={true}>
                <div className="login__body">
                    <span className="login__body__version">Version: { VERSION }</span>

                    <div className="login__body__logoWrapper">
                        <img className="login__body__logo" src={logo} />
                    </div>

                    <h2>Welcome</h2>
                    <p>Please login to start</p>

                    <form onSubmit={doLogin}>
                        <TextField value={username} onChange={e => setUsername(e.target.value)} label="Username" size="medium" fullWidth={true} />
                        <TextField value={password} onChange={e => setPassword(e.target.value)} type="password" label="Password" size="medium" fullWidth={true} />
                        <Button type="submit" color="primary" fullWidth={true} disableElevation>Login</Button>
                    </form>

                    {isValidatingToken &&
                    <div className="login__validatingToken">
                        <h2>Welcome</h2>
                        <p>We are validating your session, please wait.</p>
                    </div>
                    }

                    {loginError &&
                    <Alert severity="error">{loginError}</Alert>
                    }
                </div>
            </Fade>

            <Backdrop className={classes.backdrop} open={isLoggingIn}>
                <CircularProgress color="inherit" />
            </Backdrop>

        </div>
    )
}