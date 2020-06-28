import secureRequest from "./secureRequest";

const isAuthenticated = () => {
    return new Promise( (resolve, reject) => {
        secureRequest("/auth/authenticated", "GET").then( (data) => {
            resolve(data)
        }).catch( (error) => {
            reject(data)
        })  
    })
}

export default isAuthenticated