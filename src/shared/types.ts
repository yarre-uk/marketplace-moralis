import { createPublicClient } from 'viem';

export type bytes = `0x${string}`;

export type viemClient = ReturnType<typeof createPublicClient>;
