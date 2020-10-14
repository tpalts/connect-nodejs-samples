'use strict';

var ProtoMessages = require('connect-protobuf-messages');
var AdapterTLS = require('connect-js-adapter-tls');
var EncodeDecode = require('connect-js-encode-decode');
var Connect = require('connect-js-api');
var ping = require('./lib/ping');
var auth = require('./lib/auth');
var subscribeForSpots = require('./lib/subscribe_for_spots');
var startTime;
var protocol = new ProtoMessages([
    {
        file: 'protobuf/CommonMessages.proto'
    },
    {
        file: 'protobuf/OpenApiMessages.proto'
    }
]);
var adapter = new AdapterTLS({
    host: 'demo.ctraderapi.com',
    port: 5035
});
var encodeDecode = new EncodeDecode();
var connect = new Connect({
    adapter: adapter,
    encodeDecode: encodeDecode,
    protocol: protocol
});

ping = ping.bind(connect);
auth = auth.bind(connect);
subscribeForSpots = subscribeForSpots.bind(connect);

connect.onConnect = function () {
    startTime = Date.now();
    ping(1000);
    // Attempt to set a listener to the ProtoOAAccountAuthRes object by name, by object and by payloadType.
    // PROBLEM: none of these are fired, although the ProtoOAAccountAuthReq event is submitted later in auth(...)
    connect.on('ProtoOAAccountAuthRes', function (msg) {
        console.log('(name) auth-res', msg);
    });
    connect.on(protocol.getPayloadTypeByName('ProtoOAAccountAuthRes'), function (msg) {
        console.log('(object) auth-res', msg);
    });
    connect.on(protocol.getPayloadTypeByName('ProtoOAAccountAuthRes').payloadType, function (msg) {
        console.log('(payloadType) auth-res', msg);
    });
    auth({
        // To get these keys, I:
        // - go to https://connect.spotware.com/
        // - log in
        // - go to https://connect.spotware.com/apps/
        // - next to my demo app, click "credentials", copy + paste
        clientId: process.env.CLIENT_ID, // Mine is 55 chars
        clientSecret: process.env.CLIENT_SECRET, // Mine is 50 chars

        // To get access token, I:
        // - go to https://connect.spotware.com/
        // - log in
        // - go to https://connect.spotware.com/apps/
        // - next to my demo app, click "Playground"
        // - scope: Accounts
        // - click "Get token"
        // - check all boxed
        // - click "Allow access"
        // - copy value of "access_token"
        accessToken: process.env.ACCESS_TOKEN,

        // I received this on my email when singing up for cTrader
        ctidTraderAccountId: process.env.CTID_TRADER_ACCOUNT_ID,
    }).then(function (respond) {
        subscribeForSpots({
            // I received this on my email when singing up for cTrader
            ctidTraderAccountId: process.env.CTID_TRADER_ACCOUNT_ID,
            symbolId: 1
        }).then(function (respond) {
            // PROBLEM: none of these are fired, although the ProtoOASubscribeSpotsReq event was submitted in subscribeForSpots(...)
            connect.on('ProtoOASpotEvent', function (msg) {
                console.log('(name) spot-price', msg);
            });
            connect.on(protocol.getPayloadTypeByName('ProtoOASpotEvent'), function (msg) {
                console.log('(object) spot-price', msg);
            });
            connect.on(protocol.getPayloadTypeByName('ProtoOASpotEvent').payloadType, function (msg) {
                console.log('(payloadType) spot-price', msg);
            });
        });
    });
};

connect.onEnd = function () {
    var seconds = Math.floor((Date.now() - startTime) / 1000);
    console.log('Connection closed in ' + seconds + ' seconds');
    clearInterval(this.pingInterval);
};

connect.onError = function (e) {
    console.log(e);
};

protocol.load();
protocol.build();
connect.start();
