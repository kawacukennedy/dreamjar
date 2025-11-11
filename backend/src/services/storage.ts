import { create } from "ipfs-http-client";

const ipfs = create({
  url: process.env.IPFS_API_URL || "https://ipfs.infura.io:5001/api/v0",
});

export const uploadToIPFS = async (
  buffer: Buffer,
  filename: string,
): Promise<string> => {
  const result = await ipfs.add({
    path: filename,
    content: buffer,
  });
  return `ipfs://${result.cid.toString()}`;
};

export const getFromIPFS = async (cid: string): Promise<Buffer> => {
  const stream = ipfs.cat(cid);
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
