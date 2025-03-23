export const DEV_CONFIG = {
    SKIP_AUTH: false,
    API_MOCKING: false,
    DEBUG_MODE: true,
    // Get role from localStorage if available, otherwise default to 'admin'
    DEFAULT_ROLE: (() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                return user.role || 'admin';
            }
        } catch (e) {}
        return 'admin';
    })(),
    BYPASS_ROLE_CHECK: true
}