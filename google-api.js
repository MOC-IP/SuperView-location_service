let queryString = require('query-string')
let request = require('request')
class GoogleAPI {

    constructor() {
        this.RADIUS = 5000
        this.PLACES_API_KEY = 'AIzaSyASKxzBYOd4WcgvwAnebFN9vnlSYmWSGU0'
        this.placesEndpoint = 'https://maps.googleapis.com/maps/api/place/'
        this.placeTypes = [
            'restaurant'
            // ,
            // 'cafe',
            // 'bar',
            // 'museum'
        ]


    }
    getPlaceByName(place_to_search, next) {
        let input = place_to_search.name;
        if(place_to_search.city){
            input+=` ${place_to_search.city}`
        }
        let params = {
            input: input ,
            key: this.PLACES_API_KEY
        }
        let url = `${this.placesEndpoint}autocomplete/json?${queryString.stringify(params)}`
        let options = {
            method: 'GET',
            url: url,
            headers: { 'content-type': 'application/json' }
        }
        console.log(url);
        request(options, (err, response, body) => {
            if (err) {
                return next(err)
            }
            // console.log(response);
            body = JSON.parse(body);
            // console.log(body);
            return next(null, body);
        });

    }
    getPlaceInfo(place_to_search, next) {
        this.getPlaceByName(place_to_search, (err, data)=>{
            console.log(data);
            if(err){
                return next(err);
            }
            if(data.status=='ZERO_RESULTS'){
                return next(null, {"status":"PLACE_NOT_FOUND"});
            }
            // console.log(data);

            let target = null;
            if(place_to_search.city){
                data.predictions.forEach((prediction)=>{
                    if ( prediction.description.indexOf(place_to_search.city) != -1){
                          target = prediction;
                    }
                })
                if(!target){
                    return next(null, {"status": "PLACE_NOT_FOUND",
                                        "msg": `place ${place_to_search.name} from ${place_to_search.city} not found`})
                }
            }else{
                target = data.predictions[0]
            }
            
            this.getPlaceDetais(target.place_id,(err, data)=>{
                if(err){
                    return next(err);
                }
                return next(null, data);
            })
        })
    }
    getPlaceDetais(placeID, next) {
        let params = {
            placeid: placeID,
            key: this.PLACES_API_KEY
        }
        let url = `${this.placesEndpoint}details/json?${queryString.stringify(params)}`
        var options = {
            method: 'GET',
            url: url,
            headers: { 'content-type': 'application/json' }
        }
        console.log(url);
        request(options, (err, response, body) => {
            if (err) {
                return next(err)
            }
            // console.log(response);
            body = JSON.parse(body);
            // console.log(body);
            return next(null, body);


        })

    }

    getNearbyPlaces(lat, lon, radius, next) {
        let params = {
            location: `${lat},${lon}`,
            radius: radius,
            type: this.placeTypes[0],
            key: this.PLACES_API_KEY
        }
        let result = {}
        let searchedTypes = 0;
        this.placeTypes.forEach(type => {
            params.type = type;
            console.log(type)
            this.getNearby(params, (err, searchResponse) => {
                if (err) {
                    console.log("search nearby error for ", type);
                }
                searchedTypes++;
                result[type] = searchResponse;
                if (searchedTypes == this.placeTypes.length) {
                    // console.log(result);
                    return next(null, result)
                }

            })

        })

    }

    getNearby(params, next) {
        let url = `${this.placesEndpoint}nearbysearch/json?${queryString.stringify(params)}`
        var options = {
            method: 'GET',
            url: url,
            headers: { 'content-type': 'application/json' }
        }
        request(options, (err, response, body) => {
            if (err) {
                return next(err)
            }
            // console.log(response);
            body = JSON.parse(body);
            // console.log(body);
            return next(null, body);
        })
    }
    updateData(long, lat, next) {
        console.log(`lat: ${lat} long:${long}`)
        // console.log(next)
        this.getNearbyPlaces(lat, long, this.RADIUS, (err, data) => {
            // console.log(data);
            if (data)
                this.getPlacesDetails(data, (err, data) => {
                    return next(null, data);
                })
        });

    }
    getPlacesDetails(data, next) {
        let processed = 0;
        let total = 0;
        this.placeTypes.forEach(type => {
            total += data[type].results.length;
        })
        this.placeTypes.forEach(type => {
            let index = -1;
            let result = data[type];
            console.log(type, "==>", result.status)
            if (result.status === "OK") {
                result.results.forEach((place) => {

                    this.getPlaceDetais(place.place_id, (err, details) => {
                        processed += 1;
                        index += 1;
                        console.log(`${processed} from ${total}`);
                        // console.log(data[type]);
                        data[type].results[index]['place_details'] = details;
                        // console.log(details);

                        if (processed == total) {
                            next(null, data)

                        }
                    });

                })
            }


        })
    }

}

module.exports = GoogleAPI;