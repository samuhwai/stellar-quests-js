require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questPublicKey = process.env.S2_PUBLIC_KEY;
const questSecretKey = process.env.S2_SECRET_KEY;
const issuerSecretKey = process.env.S2_ISSUER_SECRET_KEY;

(async () => {
    const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);
    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);
    const questAccount = await server.loadAccount(questPublicKey);

    const innerTx = new StellarSdk.TransactionBuilder(questAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.bumpSequence({
            bumpTo: '1'
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    innerTx.sign(questKeypair);

    const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(issuerKeypair.publicKey(), StellarSdk.BASE_FEE, innerTx, StellarSdk.Networks.TESTNET)

    feeBumpTx.sign(issuerKeypair);
    await questUtils.submitTransaction(feeBumpTx);
})();
