require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questPublicKey = process.env.S1_PUBLIC_KEY;
const questSecretKey = process.env.S1_SECRET_KEY;
const issuerPublicKey = process.env.S1_ISSUER_PUBLIC_KEY;

(async () => {
    const questAccount = await server.loadAccount(questPublicKey);
    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);

    const tx = new StellarSdk.TransactionBuilder(questAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.payment({
            destination: issuerPublicKey,
            asset: StellarSdk.Asset.native(),
            source: questKeypair.publicKey(),
            amount: '10',
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(questKeypair);
    await questUtils.submitTransaction(tx);
})();
