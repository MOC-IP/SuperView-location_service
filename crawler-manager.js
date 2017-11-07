// var tripAdvisorConfig = require('');
var GoogleApi = require('./google-api');
var googleApi = new GoogleApi();

class CrawlerManager{
    constructor(){
        this.lat = 47.173841;
        this.long = 27.574922
   
        this.apis = [];
        this.apis.push(googleApi);
    }

    update(city, next){
        //to get long and lat for city
        console.log("here motherfucker")
        let apiProccesed = 0
        let allData = {};
        console.log(this.apis.length)
        this.apis.forEach((api)=>{
            console.log(api);
            api.updateData(this.long, this.lat, (err, data)=>{
                apiProccesed+=1;
                allData[api.constructor.name] = data;
                // console.logs(data);   
                console.log(`here: ${apiProccesed}, ${this.apis.length} ===> ${apiProccesed === this.apis.length}`)
                if (apiProccesed === this.apis.length){
                    return next(null, allData)
                }
            });
            
        })
    }
}

module.exports = CrawlerManager;