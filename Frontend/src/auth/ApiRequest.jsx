// Funzione generale per gestire tutte le richieste API
export const apiRequest = async (url, options = {}, navigate) => {
    const token = localStorage.getItem('token'); 

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token'); 
            localStorage.removeItem('user');
            sessionStorage.removeItem('albumSection');
            navigate('/login');
            throw new Error('Not authorized, redirecting to login.');
        }



        return response;
    } catch (error) {
        navigate('/login');
        console.error('Error in API request:', error);
        throw error;
    }
};
