// This file contains a custom hook for managing authentication state.

import { useState, useEffect } from 'react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { login as loginService, register as registerService } from '../services/auth';

const useAuth = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is already authenticated
        const checkUser = async () => {
            try {
                // Logic to check user authentication (e.g., token validation)
                // Set user state if authenticated
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const userData = await loginService(credentials);
            setUser(userData);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const newUser = await registerService(userData);
            setUser(newUser);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    return { user, loading, error, login, register };
};

export default useAuth;