import { Router, Request, Response } from 'express';

interface HelloResponse {
  greeting: string;
  target: string;
}

const buildGreeting = (target: string): HelloResponse => ({
  greeting: 'Hello',
  target,
});

const formatGreeting = (payload: HelloResponse): string =>
  `${payload.greeting}, ${payload.target}!`;

const router = Router();

router.get('/hello', (req: Request, res: Response) => {
  const target =
    typeof req.query.name === 'string' && req.query.name.length > 0
      ? req.query.name
      : 'World';

  res.send(formatGreeting(buildGreeting(target)));
});

export default router;
