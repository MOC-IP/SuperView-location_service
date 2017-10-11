var http = require("http");
var express = require('express')
var app = express();
var logger = require('morgan')
var bodyParser = require('body-parser')
var cors = require("cors")

var server = http.createServer(app);
port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: false })); //Parses urlencoded bodies
app.use(bodyParser.json()) //SendJSON response
app.use(logger('dev'))
app.use(cors());

var CrawlerManager = require('./crawler-manager')

var crawlerManager = new CrawlerManager();


var router = express.Router();

router.route('/places')
    .get((req, res) => {
        // console.log('here')
        crawlerManager.update("Iasi", (err, data) => {
            if (err)
                return res.status(400).json({
                    status: "error while updating restaurants"
                })
            res.status(200).send(data)
        })
    })
router.route('/health')
    .get((req, res)=>{
        res.send('checkout /places')
    })
app.use('/', router);
server.listen(port, () => {
    console.log(`backend listening on port ${port}`);
});
