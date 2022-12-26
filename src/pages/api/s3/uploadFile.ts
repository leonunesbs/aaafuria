import { NextApiRequest, NextApiResponse } from 'next';

import S3 from 'aws-sdk/clients/s3';

const s3 = new S3({
  region: 'sa-east-1',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  signatureVersion: 'v4',
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb', // Set desired value here
    },
  },
};

export function generateImageName(fileName: string): string {
  const extension = fileName.split('.').pop();
  return `${Date.now()}.${extension}`;
}
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, path, type } = req.body;

    const fileParams = {
      Bucket: process.env.S3_BUCKET,
      Key: `${path}/${generateImageName(name)}`,
      Expires: 600,
      ContentType: type,
      ContentDisposition: 'inline',
      ACL: 'public-read',
    };

    const url = await s3.getSignedUrlPromise('putObject', fileParams);

    res.status(200).json({ url });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
}
