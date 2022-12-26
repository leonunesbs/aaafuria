import { authedProcedure, router } from '../trpc';

import S3 from 'aws-sdk/clients/s3';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const s3_init = new S3({
  region: 'sa-east-1',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  signatureVersion: 'v4',
});

function generateImageName(fileName: string): string {
  const extension = fileName.split('.').pop();
  return `${Date.now()}.${extension}`;
}

export const s3 = router({
  getSignedUrl: authedProcedure
    .input(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string(),
        size: z.number(),
        maxSize: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { path, name, type, size, maxSize } = input;
      const maxFileSizeInMB = maxSize || 5;

      if (size > maxFileSizeInMB * 1024 * 1024) {
        throw new TRPCError({
          code: 'PAYLOAD_TOO_LARGE',
          message: `O arquivo deve ter no máximo ${maxFileSizeInMB}MB`,
        });
      }

      const fileParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `${path}/${generateImageName(name)}`,
        Expires: 10 * 60, // 10 minutes
        ContentType: type,
        ContentDisposition: 'inline',
        ACL: 'public-read',
      };

      const url = await s3_init.getSignedUrlPromise('putObject', fileParams);

      return { url };
    }),
  deleteFile: authedProcedure
    .input(z.string())
    .mutation(async ({ input: path }) => {
      const fileParams = {
        Bucket: process.env.S3_BUCKET as string,
        Key: path,
      };

      await s3_init.deleteObject(fileParams).promise();

      return true;
    }),
});
