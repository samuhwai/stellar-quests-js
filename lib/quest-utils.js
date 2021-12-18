const {HORIZON_TESTNET_URL, DEFAULT_BUILDER_OPTS, DEFAULT_TIMEOUT, FRIEND_BOT_URL} = require('./constants');

const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server(HORIZON_TESTNET_URL);
const axios = require('axios');

async function resetQuestAccount(sourceSecretKey) {
    const {secretKey} = await createNewAccount();
    await mergeAccounts(sourceSecretKey, secretKey)
}

async function mergeAccounts(sourceSecretKey, destinationSecretKey) {
    const destinationKeypair = StellarSdk.Keypair.fromSecret(destinationSecretKey);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    const tx = new StellarSdk.TransactionBuilder(sourceAccount, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.accountMerge({
            destination: destinationKeypair.publicKey(),
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(sourceKeypair);
    await submitTransaction(tx);
}

async function resetAccountThreshold(secretKey) {
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(keypair.publicKey());

    const tx = new StellarSdk.TransactionBuilder(account, DEFAULT_BUILDER_OPTS)
        .addOperation(StellarSdk.Operation.setOptions({
            lowThreshold: 0,
            medThreshold: 0,
            highThreshold: 0
        }))
        .setTimeout(DEFAULT_TIMEOUT)
        .build();

    tx.sign(keypair);
    await submitTransaction(tx);
}

async function createNewAccount() {
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    return axios.get(`${FRIEND_BOT_URL}?addr=${encodeURIComponent(publicKey)}`)
        .then(({data}) => {
            console.log(`Created account => public key: ${publicKey}, secret key: ${secretKey}`)
            console.log(data)
            return {publicKey, secretKey}
        })
        .catch(logError);
}

async function cancelOpenOffers(secretKey) {
    const keypair = StellarSdk.Keypair.fromSecret(secretKey)
    await server.loadAccount(keypair.publicKey())
        .then(account => {
            server.offers()
                .forAccount(keypair.publicKey())
                .call()
                .then(offers => {
                    return cancelOffers(keypair, account, offers);
                });
        });
}

function parseAsset(asset) {
    if (asset.asset_type === 'native') {
        return StellarSdk.Asset.native();
    } else {
        return new StellarSdk.Asset(asset.asset_code, asset.asset_issuer);
    }
}

function cancelOffers(keypair, account, res) {
    const offers = res.records;
    if (offers.length === 0) {
        return;
    }

    const operations = offers.map(offer => {
        let buying = parseAsset(offer.buying);
        let selling = parseAsset(offer.selling);
        return StellarSdk.Operation.manageSellOffer({
            buying: buying,
            selling: selling,
            amount: '0',
            price: offer.price_r,
            offerId: offer.id,
        });
    });

    const builder = new StellarSdk.TransactionBuilder(account, DEFAULT_BUILDER_OPTS);
    builder.operations = operations;
    const tx = builder.build();

    tx.sign(keypair);

    submitTransaction(tx).then(() => {
        res.next().then(account, offers => cancelOffers(keypair, account, offers));
    });
}

async function submitTransaction(tx) {
    return server.submitTransaction(tx)
        .then(console.log)
        .catch(logError);
}

function logError(e) {
    if (e.response) {
        console.log(e.response.data);
        console.log(e.response.status);
        console.log(e.response.headers);
    } else if (e.request) {
        console.log(e.request);
    } else {
        console.log('Error', e.message);
    }
}

function logServerAssets() {
    server.assets()
        .call()
        .then(({records}) => {
            records.forEach(console.log)
        });
}

function logAccountBalance(accountId) {
    server.loadAccount(accountId)
        .then(({balances}) => console.log(balances))
}

module.exports = {
    resetQuestAccount,
    mergeAccounts,
    resetAccountThreshold,
    createNewAccount,
    cancelOpenOffers,
    logAccountBalance,
    logServerAssets,
    submitTransaction
}