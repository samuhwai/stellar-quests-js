require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questPublicKey = process.env.S2_PUBLIC_KEY;
const questSecretKey = process.env.S2_SECRET_KEY;
const issuerPublicKey = process.env.S2_ISSUER_PUBLIC_KEY;
const issuerSecretKey = process.env.S2_ISSUER_SECRET_KEY;

(async () => {
    const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);
    const customAsset = new StellarSdk.Asset('HEYY', issuerPublicKey);

    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);
    const questAccount = await server.loadAccount(questPublicKey);

    const tx = new StellarSdk.TransactionBuilder(questAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: customAsset,
            limit: '10000'
        }))
        .addOperation(StellarSdk.Operation.payment({
            destination: questKeypair.publicKey(),
            asset: customAsset,
            source: issuerKeypair.publicKey(),
            amount: '100',
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(questKeypair);
    tx.sign(issuerKeypair);
    await questUtils.submitTransaction(tx);
})();
