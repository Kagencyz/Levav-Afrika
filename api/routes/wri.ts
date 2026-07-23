import { z } from 'zod';
import { router, publicProcedure } from '../router';

export const wriRouter = router({
  get: publicProcedure
    .input(z.object({ talentId: z.number() }).optional())
    .query(async () => {
      return null;
    }),
});
