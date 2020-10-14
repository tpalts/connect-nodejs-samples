'use strict';

var auth = async function (params) {
    await this.sendGuaranteedCommand(
        this.protocol.getPayloadTypeByName('ProtoOAApplicationAuthReq'),
        {
            clientId: params.clientId,
            clientSecret: params.clientSecret
        }
    );

    return this.sendGuaranteedCommand(
        this.protocol.getPayloadTypeByName('ProtoOAAccountAuthReq'),
        {
            ctidTraderAccountId: params.ctidTraderAccountId,
            accessToken: params.accessToken
        }
    );
};

module.exports = auth;
