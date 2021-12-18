require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questPublicKey = process.env.S1_PUBLIC_KEY;
const questSecretKey = process.env.S1_SECRET_KEY;
const issuerPublicKey = process.env.S1_ISSUER_PUBLIC_KEY;

(async () => {
    const rkn = new StellarSdk.Asset('RKN', issuerPublicKey);

    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);
    const questAccount = await server.loadAccount(questPublicKey);

    const tx = new StellarSdk.TransactionBuilder(questAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: rkn,
            limit: '10000'
        }))
        .addOperation(StellarSdk.Operation.payment({
            destination: questPublicKey,
            asset: rkn,
            amount: '100',
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(questKeypair);
    await questUtils.submitTransaction(tx);
})();
