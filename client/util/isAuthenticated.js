import secureRequest from "./secureRequest";

const isAuthenticated = () => {
    secureRequest("/auth/authenticated", "GET").then( (data) => {
        return true
    }).catch( (error) => {
        return false;
    })
}

export default isAuthenticated