'use strict';

var subscribeForSpots = function (params) {
    return this.sendGuaranteedCommand(
        this.protocol.getPayloadTypeByName('ProtoOASubscribeSpotsReq'),
        {
            ctidTraderAccountId: params.ctidTraderAccountId,
            symbolId: params.symbolId
        }
    );
};

module.exports = subscribeForSpots;
