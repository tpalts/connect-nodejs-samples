'use strict';

var ping = function (interval) {
    var payloadType = this.protocol.getPayloadTypeByName('ProtoOAVersionReq');
    this.pingInterval = setInterval(function () {
        this.sendGuaranteedCommand(payloadType);
    }.bind(this), interval);
};

module.exports = ping;
