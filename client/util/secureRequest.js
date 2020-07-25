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
                        if(res.ok){
                            res.json().then((data) => {
                                resolve(data)
                            })   
                        } else {
                            res.json().then((err) => {
                                reject(err)
                            }) 
                        }
                    }).catch( (error) => {
                        reject(error)
                    })  
                }).catch( error => {
                    reject(error)
                })
            } else {
                if(res.ok){
                    res.json().then((data) => {
                        resolve(data)
                    })   
                } else {
                    res.json().then((err) => {
                        reject(err)
                    }) 
                }
            }
        }).catch(error => {
            reject(error)
        })
    })
}

export default secureRequest