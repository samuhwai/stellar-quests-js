require('dotenv').config();
const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT} = require('../../lib/constants');
const questUtils = require('../../lib/quest-utils');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);

const questPublicKey = process.env.S2_PUBLIC_KEY;
const questSecretKey = process.env.S2_SECRET_KEY;

(async () => {
    const questKeypair = StellarSdk.Keypair.fromSecret(questSecretKey);
    const questAccount = await server.loadAccount(questPublicKey);

    const claimPredicate = StellarSdk.Claimant.predicateBeforeAbsoluteTime(parseInt(Date.now() / 1000).toString())
    const claimant = new StellarSdk.Claimant(questKeypair.publicKey(), claimPredicate)

    const tx = new StellarSdk.TransactionBuilder(questAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.createClaimableBalance({
            asset: StellarSdk.Asset.native(),
            amount: '100',
            claimants: [claimant]
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(questKeypair);
    await questUtils.submitTransaction(tx);
})();
