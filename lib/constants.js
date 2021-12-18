const StellarSdk = require("stellar-sdk");

const HORIZON_PUBLIC_URL = 'https://horizon.stellar.org';
const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';
const FRIEND_BOT_URL = 'https://friendbot.stellar.org';
const DEFAULT_TIMEOUT = 30;
const DEFAULT_BUILDER_OPTS = {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
    timebounds: {
        minTime: 0,
        maxTime: 0
    }
};

module.exports = {
    DEFAULT_BUILDER_OPTS,
    HORIZON_PUBLIC_URL,
    HORIZON_TESTNET_URL,
    DEFAULT_TIMEOUT,
    FRIEND_BOT_URL
}