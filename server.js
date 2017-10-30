var http = require("http");
var express = require('express')
var app = express();
var logger = require('morgan')
var bodyParser = require('body-parser')
var cors = require("cors")

var server = http.createServer(app);
port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false })); //Parses urlencoded bodies
app.use(bodyParser.json()) //SendJSON response
app.use(logger('dev'))
app.use(cors());


//#region Imports 
var CrawlerManager = require('./crawler-manager')
var crawlerManager = new CrawlerManager();
var FacebookAPI = require('./facebook-api');
var facebookAPI = new FacebookAPI();
var GoogleAPI = require('./google-api');
var googleAPI = new GoogleAPI();
//#endregion

var googleRouter = express.Router();
//#region  GoogleRouter Definition

googleRouter.route('/places')
    .get((req, res) => {
        //#region Fetch all places from google for city
        // crawlerManager.update("Iasi", (err, data) => {
        //     if (err)
        //         return res.status(400).json({
        //             status: "error while updating restaurants"
        //         })
        //     res.status(200).send(data)
        // })

        //#endregion 
        if (!req.query.name) {
            return res.status(400).send({ "status": "bad request parameter name not found" });
        }
        googleAPI.getPlaceInfo(req.query.name, (err, data) => {
            if (err) {
                // console.log(err);
                return res.status(500).send(err);
            }
            return res.status(200).send(data);
        })

    })


//#endregion
app.use('/google', googleRouter);

var facebookRouter = express.Router();
//#region FacebookRouter Definition
facebookRouter.route('/places')
    .get((req, res) => {
        // console.log(req.query.name)
        if (!req.query.name) {
            return res.status(400).send({ "status": "bad request parameter name not found" });
        }
        facebookAPI.getPlaceInfo(req.query.name, (err, data) => {
            if (err) {
                // console.log(err);
                return res.status(500).send(err);
            }
            return res.status(200).send(data);
        })
    })

//#endregion
app.use("/facebook", facebookRouter);

app.get('/health',(req, res) => {
    res.send('checkout facebook/places or google/places')
});
facebookAPI.init((err, status) => {
    server.listen(port, () => {
        console.log(`backend listening on port ${port}`);
    });

})
