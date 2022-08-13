"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const axios = require('axios');
const dfff = require('dialogflow-fulfillment');

const server = express();

server.use(
    bodyParser.urlencoded({
        extended: true
    })
);

server.use(bodyParser.json());

server.get('/', function(req, res) {
    res.send('Server is live running on 8000')
})

server.post("/webhook", async function (req, res) {
    const orderId = req.body.queryResult &&
                    req.body.queryResult.parameters &&
                    req.body.queryResult.parameters.orderId ?
                    req.body.queryResult.parameters.orderId :
                    '';
    const responseData = await axios.post('https://orderstatusapi-dot-organization-project-311520.uc.r.appspot.com/api/getOrderStatus', {
        orderId: orderId
        })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
        console.log(error);
    });

    const shipmentDate = new Date(responseData.data.shipmentDate).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})

    const agent = new dfff.WebhookClient({
        request: req,
        response: res
    });

    function sendOrderShipmentDate(agent) {
        agent.add(`Your order ${orderId} will be shipped on ${shipmentDate}`)
    }

    var intentMap = new Map();
    intentMap.set('getOrderId', sendOrderShipmentDate);
    agent.handleRequest(intentMap);

});

server.listen(process.env.PORT || 8000, function () {
    console.log("Server up and listening");
});
