const secureRequest = (url, method, data) => {
    return new Promise( (resolve, reject) => {
        fetch(url, {
            method: method,
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: method == "GET" ? undefined : JSON.stringify(data) 
        }).then(res => {
            // if expired token
            if(res.status == 401){
                fetch("/auth/token/refresh", {
                    method: "POST",
                    credentials: "include"
                }).then( () => {
                    fetch(url, {
                        method: method,
                        credentials: "include",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: method == "GET" ? undefined : JSON.stringify(data) 
                    }).then( (res) => {
                        res.json().then((data) => {
                            resolve(data)
                        })
                    }).catch( (error) => {
                        console.log(29)
                        reject(error)
                    })  
                }).catch( error => {
                    console.log(33)
                    reject(error)
                })
            } else {
                res.json().then((data) => {
                    resolve(data)
                })
            }
        }).catch(error => {
            reject(error)
        })
    })
}

export default secureRequest