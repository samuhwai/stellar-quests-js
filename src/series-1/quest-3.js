require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');

const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);
const questUtils = require('../../lib/quest-utils');
const questPublicKey = process.env.S1_PUBLIC_KEY;
const questSecretKey = process.env.S1_SECRET_KEY;

(async () => {
    const questAccount = await server.loadAccount(questPublicKey);
    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);

    const tx = new StellarSdk.TransactionBuilder(questAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.manageData({
            name: 'Hello',
            value: 'World',
            source: questKeypair.publicKey()
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(questKeypair);
    await questUtils.submitTransaction(tx);
})();
