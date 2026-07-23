import { z } from 'zod';
import { router, publicProcedure } from '../router';
import { getPresignedUrl as getS3PresignedUrl } from '../lib/s3';

export const uploadRouter = router({
  getPresignedUrl: publicProcedure
    .input(
      z.object({
        key: z.string().min(1),
        contentType: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const url = await getS3PresignedUrl(input.key, input.contentType);
      return { url };
    }),
});
