require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);
const crypto = require("crypto");

const questPublicKey = process.env.S2_PUBLIC_KEY;

(async () => {
    const {publicKey, secretKey} = await questUtils.createNewAccount();
    const issuerAccount = await server.loadAccount(publicKey);
    const issuerKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const memoHash = crypto.createHash('sha256')
        .update('Stellar Quest Series 2')
        .digest('hex')

    const tx = new StellarSdk.TransactionBuilder(issuerAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.createAccount({
            destination: questPublicKey,
            startingBalance: '5000'
        }))
        .addMemo(StellarSdk.Memo.hash(memoHash))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(issuerKeypair);

    questUtils.submitTransaction(tx)
        .then(() => questUtils.logAccountBalance(questPublicKey))
})();



