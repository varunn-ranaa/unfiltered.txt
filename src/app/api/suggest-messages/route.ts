import { groq } from '@ai-sdk/groq';
import { streamText, APICallError } from 'ai';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const maxDuration = 10;

const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by ||. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, '1 h'), // 2 requests per hour per IP
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  // Standard rate-limit headers, attached to every response (success or not)
  const rateLimitHeaders = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  if (!success) {
    return NextResponse.json(
      {
        name: 'RateLimitError',
        message: 'Too many requests. Try again later.',
        resetAt: reset,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          // seconds until the client should retry, per RFC 6585
          'Retry-After': Math.max(
            0,
            Math.ceil((reset - Date.now()) / 1000)
          ).toString(),
        },
      }
    );
  }

  try {
    const result = streamText({
      model: groq('openai/gpt-oss-20b'),
      prompt,
      temperature: 0.9,
    });

    return result.toTextStreamResponse({ headers: rateLimitHeaders });
  } catch (error) {
    if (APICallError.isInstance(error)) {
      return NextResponse.json(
        { name: error.name, status: error.statusCode, message: error.message },
        { status: error.statusCode ?? 500 }
      );
    }
    console.error('Unexpected error in suggest-messages:', error);
    return NextResponse.json(
      { name: 'UnknownError', message: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}