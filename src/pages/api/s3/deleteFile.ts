import { NextApiRequest, NextApiResponse } from 'next';

import S3 from 'aws-sdk/clients/s3';

const s3 = new S3({
  region: 'sa-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  signatureVersion: 'v4',
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { path } = req.body;

    const fileParams = {
      Bucket: process.env.AWS_BUCKET as string,
      Key: path,
    };

    await s3.deleteObject(fileParams).promise();

    res.status(200).json({ message: 'File deleted' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
}
