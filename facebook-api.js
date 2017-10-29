fb_app = require("./config/fb-app.config.json");
const PARAMS = {
    fields: [
        "category_list",
        "engagement",
        "location",
        "parking",
        "price_range",
        "rating_count",
        "overall_star_rating",
        "restaurant_services",
        "restaurant_specialties"
    ].toString()
}
class FacebookAPI {

    constructor() {
        this.FB = require('fb');
        this.graph = require('fbgraph');
    }
    init(next) {
        this.FB.api('oauth/access_token', {
            client_id: fb_app.app_id,
            client_secret: fb_app.app_secret,
            grant_type: 'client_credentials'
        }, (res) => {
            if (!res || res.error) {
                return next(!res ? 'error occurred' : res.error);
            }
            this.graph.setAccessToken(res.access_token);
            next(null, 'ok');
        });
    }

    getPlaceByName(placeName, next) {
        var searchOptions = {
            q: placeName,
            type: "Place"
        }
        // console.log(searchOptions, this.graph.getAccessToken());
        this.graph.search(searchOptions, (err, res) => {
            if (err) {
                return next(err)
            }
            return next(null, res);
        })
    }

    getPlaceInfo(placeName, next) {
        this.getPlaceByName(placeName, (err, res) => {
            if (err) {
                return next(err);
            }
            let place = res.data[0];
            this.graph.get(place.id, PARAMS, (err, res) => {
                if (err)
                    return next(err);
                return next(null, res);
            })

        })
    }

}

module.exports = FacebookAPI;