const request = require("request")

let EventTransmitter = (project,app_url,username,password) => {

    this.postEvent = (event,params) => new Promise((resolve,reject)=>{
        var request_options = {
            url: app_url + '/api/postEvent',
            auth: {
              user: username,
              password: password
            },
            json: {
                "project":project,
                "event":event,
                "params":params
            }
        }
        request.post(request_options,(err,res,body)=>{
            if(err){
                reject(err)
                return
            }
            if(res.statusCode == 200){
                body = JSON.parse(body)
                resolve(body)
            }else{
                reject(body)
            }
        })
    })
}