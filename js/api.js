/* CENTRAL API CONFIGURATION */
const API_BASE = "https://a4shgcemb1.execute-api.ap-south-1.amazonaws.com/prod";

/**
 * Universal Secure Fetch Engine
 * Automatically attaches the JWT Bearer token to every request.
 * If the token is expired/invalid (401), it automatically kicks the user to the login screen.
 */
async function fetchSecure(endpoint, options = {}) {
    // 1. Grab the token we saved during login
    const token = sessionStorage.getItem("authToken");
    
    // 2. Build the secure headers
    const headers = {
        "Content-Type": "application/json",
        // Only attach the Authorization header if a token exists
        ...(token && { "Authorization": `Bearer ${token}` })
    };

    // 3. Merge custom options (like POST/PUT methods) with our secure headers
    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };

    try {
        // 4. Fire the request to AWS
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        // 5. Global Security Guard: If AWS rejects the token, boot them out!
        if (response.status === 401 || response.status === 403) {
            console.warn("Security Alert: Invalid or expired JWT token.");
            sessionStorage.clear();
            window.location.href = "login.html";
            throw new Error("Session expired. Please log in again.");
        }
        
        return response;
    } catch (error) {
        console.error(`[API Error] Failed to fetch ${endpoint}:`, error);
        throw error;
    }
}