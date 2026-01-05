import api from './api';

const login = async (username, password) => {
    const response = await api.post('/auth/login', {
        username,
        password,
    });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') return null;
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

const authService = {
    login,
    logout,
    getCurrentUser,
};

export default authService;
