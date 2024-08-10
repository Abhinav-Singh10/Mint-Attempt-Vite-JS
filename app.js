import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplCandyMachine as mplCoreCandyMachine, mintV1 } from "@metaplex-foundation/mpl-core-candy-machine";
import { transactionBuilder,keypairIdentity, some } from '@metaplex-foundation/umi';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import dotenv from 'dotenv';
import {Keypair,PublicKey} from'@solana/web3.js';

dotenv.config();

const numArrayCandyMachineOwner = process.env.SECRET_KEY.split(',').map(Number);
const numArrayRecipient = process.env.RECIPIENT.split(',').map(Number);
const umi = createUmi('https://api.devnet.solana.com').use(mplCoreCandyMachine());

const CandyMachineOwnerkeypair = Keypair.fromSecretKey(
    Uint8Array.from(numArrayCandyMachineOwner),{skipValidation:true}
);
const Recipient=Keypair.fromSecretKey(
    Uint8Array.from(numArrayRecipient),{skipValidation:true}
);

umi.use(keypairIdentity(CandyMachineOwnerkeypair));
console.log("Public Key Creator: ", CandyMachineOwnerkeypair.publicKey.toString());
console.log("Public Key Recipient: ", Recipient.publicKey.toString());

const options= {
    send: { skipPreflight: true },
    confirm: { commitment: 'processed' }
};

async function main() {
    // Mint NFTs
    try {
        const numMints = 3;
        let minted = 0;
        for (let i = 0; i < numMints; i++) {
            await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(
                    mintV1(umi, {
                        candyMachine: new PublicKey('2KmcVrBcwdDbbi9VzRdaYNEb9EWbBnCeCND3bm3UQ7mn'),
                        asset: Recipient,
                        collection: new PublicKey('DAFMRcXa1ZjPqTWmDES9hSCPJb3ovQhmvA8PQu8QFgMy'),
                        mintArgs: {
                            solPayment: some({ destination: CandyMachineOwnerkeypair.publicKey }),
                        },
                    })
                )
                .sendAndConfirm(umi, options);
            minted++;
        }
        console.log(`6. ✅ - Minted ${minted} NFTs.`);
    } catch (error) {
        console.log('6. ❌ - Error minting NFTs.',error);
    }
}


main().catch(console.error);

