const express = require('express');
const requestLoggerFactory = require('morgan');
const WebSocket = require('ws');
const {Netifi} = require('netifi-js-client');
const {HelloServiceServer} = require('./generated/rsocket/services_rsocket_pb');
const {DefaultHelloService} = require('./services/DefaultHelloService');

const destinationName = 'server-rsocket';
const groupName = 'netifi-rsocket-js-example.servers';

const netifiGateway = Netifi.create({
    setup: {
        group: groupName,
        destination: destinationName,
        accessKey: process.env.NETIFI_AUTHENTICATION_0_ACCESSKEY,
        accessToken: process.env.NETIFI_AUTHENTICATION_0_ACCESSTOKEN,
    },
    transport: {
        url: 'ws://netifi-broker:8101/',
        wsCreator: (url) => {
            return new WebSocket(url);
        }
    },
});

const helloService = new DefaultHelloService();
const helloServiceServer = new HelloServiceServer(helloService);
netifiGateway.addService("com.viglucci.netifi.rsocket.js.example.service.HelloService", helloServiceServer);

const httpApp = express();

httpApp.use(requestLoggerFactory('combined'));

httpApp.get('/', (req, res, next) => {
    res.send('server-rsocket');
});

module.exports = async () => {
    return Promise.all([
        netifiGateway,
        httpApp
    ]);
};
