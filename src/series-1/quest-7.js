require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questSecretKey = process.env.S1_SECRET_KEY;

(async () => {
    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);

    const {publicKey, secretKey} = await questUtils.createNewAccount();
    const channelAccount = await server.loadAccount(publicKey);
    const channelKeypair = StellarSdk.Keypair.fromSecret(secretKey);

    const tx = new StellarSdk.TransactionBuilder(channelAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.payment({
            destination: channelKeypair.publicKey(),
            asset: StellarSdk.Asset.native(),
            source: questKeypair.publicKey(),
            amount: '1',
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(questKeypair);
    tx.sign(channelKeypair);
    await questUtils.submitTransaction(tx);
})();
