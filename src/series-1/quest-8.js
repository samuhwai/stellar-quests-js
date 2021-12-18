require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questPublicKey = process.env.S1_PUBLIC_KEY;
const questSecretKey = process.env.S1_SECRET_KEY;

(async () => {
    const srtAsset = new StellarSdk.Asset('SRT', 'GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B');

    const questAccount = await server.loadAccount(questPublicKey);
    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);

    const tx = new StellarSdk.TransactionBuilder(questAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: srtAsset,
            limit: '10000'
        }))
        .addOperation(StellarSdk.Operation.pathPaymentStrictReceive({
            sendAsset: StellarSdk.Asset.native(),
            sendMax: '1000',
            destination: questKeypair.publicKey(),
            destAsset: srtAsset,
            destAmount: '1'
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(questKeypair);
    await questUtils.submitTransaction(tx);
})();
