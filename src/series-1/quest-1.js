require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questPublicKey = process.env.S1_PUBLIC_KEY;

(async () => {
    const {publicKey, secretKey} = await questUtils.createNewAccount();
    const issuerAccount = await server.loadAccount(publicKey);
    const issuerKeypair = StellarSdk.Keypair.fromSecret(secretKey);

    const tx = new StellarSdk.TransactionBuilder(issuerAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.createAccount({
            destination: questPublicKey,
            startingBalance: '1000'
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();
    
    tx.sign(issuerKeypair);

    questUtils.submitTransaction(tx)
        .then(() => questUtils.logAccountBalance(questPublicKey))
})();