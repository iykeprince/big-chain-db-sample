import BigchainDB from 'bigchaindb-driver';
import bip39 from 'bip39'

const API_PATH = 'https://test.ipdb.io/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const seed = bip39.mnemonicToSeedSync('seedPhrase').slice(0, 32)
const alice = new BigchainDB.Ed25519Keypair(seed)

const painting = {
  name: 'Meninas',
  author: 'Diego Rodríguez de Silva y Velázquez',
  place: 'Madrid',
  year: '1656'
}

async function createPaint() {


  const txCreatePaint = BigchainDB.Transaction.makeCreateTransaction({ painting }, {
    datetime: new Date().toString(),
    location: 'Madrid',
    value: {
      value_eur: '25000000€',
      value_btc: '2200',
    }
  }, [
    BigchainDB.Transaction.makeOutput(BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))
  ], alice.publicKey);

  const txSigned = BigchainDB.Transaction.signTransaction(txCreatePaint, alice.privateKey)

  const res = await conn.postTransactionCommit(txSigned);
  console.log('post signed tx response', res);
  console.log('txSignature id', txSigned.id);
  console.log('tx', txSigned);
}

// createPaint().then().catch(err => console.log(err, 'error'))

async function transferOwnership(txCreatedID, newOwner) {
  conn.getTransaction(txCreatedID).then(async (txCreated) => {
    const createTransfer = BigchainDB.Transaction.makeTransferTransaction([
      {
        tx: txCreated,
        output_index: 0
      }
    ], [
      BigchainDB.Transaction.makeOutput(
        BigchainDB.Transaction.makeEd25519Condition(newOwner.publicKey)
      )
    ],
      {
        datetime: new Date().toString(),
        value: {
          value_eur: '30000000€',
          value_btc: '2100',
        }
      });
    const signedTransfer = BigchainDB.Transaction.signTransaction(createTransfer, alice.privateKey);

    const res = await conn.postTransactionCommit(signedTransfer);

    console.log('message', 'Transfer Transaction created')
    console.log('txID', res.id)
    console.log('tx', res)
  })
}
const seed2 = bip39.mnemonicToSeedSync('seedPhrase').slice(0, 32)
const newOwner = new BigchainDB.Ed25519Keypair(seed2)
// transferOwnership('c1da65bb37094f2b0235cb94df0de1a21045c1890ca091a4110401323aafdbf1', newOwner).then().catch(err => console.log(err, 'error'))