
let report_server_app = "http://86.104.32.254/app"
var EventTransitter = require("./index")("mokhche",report_server_app,"admin","fvkvHqZh8B56egk8")

EventTransitter.postEvent("salam",null,(s)=>console.log(s))