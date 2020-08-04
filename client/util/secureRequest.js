import cookies from "js-cookies";

const secureRequest = (url, method, data) => {
    return new Promise( (resolve, reject) => {
        fetch(url, {
            method: method,
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': cookies.getItem("csrf_access_token")
            },
            body: method == "GET" ? undefined : JSON.stringify(data) 
        }).then(res => {
            if(res.status == 401){
                fetch("/auth/token/refresh", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': cookies.getItem("csrf_refresh_token")
                    },
                }).then( () => {
                    fetch(url, {
                        method: method,
                        credentials: "include",
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': cookies.getItem("csrf_access_token")
                        },
                        body: method == "GET" ? undefined : JSON.stringify(data) 
                    }).then( (res) => {
                        if(res.ok){
                            console.log(res)
                            res.json().then((data) => {
                                resolve(data)
                            })   
                        } else {
                            res.json().then((err) => {
                                reject(err)
                            }) 
                        }
                    }).catch( (error) => {
                        console.log("Refresh token not retreived")
                        reject(error)
                    })  
                }).catch( error => {
                    reject(error)
                })
            } else {
                if(res.ok){
                    console.log(res)
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
            console.log("ERROR")
            reject(error)
        })
    })
}

export default secureRequest