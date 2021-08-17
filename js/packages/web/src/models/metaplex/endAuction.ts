import { getAuctionExtended, programIds } from '@oyster/common';
import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { serialize } from 'borsh';

import { EndAuctionArgs, getAuctionKeys, SCHEMA } from '.';

export async function endAuction(
  vault: PublicKey,
  auctionManagerAuthority: PublicKey,
  instructions: TransactionInstruction[],
) {
  const PROGRAM_IDS = programIds();
  const store = PROGRAM_IDS.store;
  if (!store) {
    throw new Error('Store not initialized');
  }

  const { auctionKey, auctionManagerKey } = await getAuctionKeys(vault);
  const auctionExtended = await getAuctionExtended({
    auctionProgramId: PROGRAM_IDS.auction,
    resource: vault,
  });
  const value = new EndAuctionArgs({ reveal: null });
  const data = Buffer.from(serialize(SCHEMA, value));

  const keys = [
    {
      pubkey: auctionManagerKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionExtended,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: auctionManagerAuthority,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: store,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: PROGRAM_IDS.auction,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];

  instructions.push(
    new TransactionInstruction({
      keys,
      programId: PROGRAM_IDS.metaplex,
      data,
    }),
  );
}
