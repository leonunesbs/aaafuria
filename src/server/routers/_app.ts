import { auth, group, payment, plan, s3, schedule, store, user } from '.';

import { router } from '../trpc';

export const appRouter = router({
  auth,
  user,
  store,
  plan,
  group,
  schedule,
  s3,
  payment,
});
export type AppRouter = typeof appRouter;
