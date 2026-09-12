import { groq } from '@ai-sdk/groq';
import { streamText,APICallError } from 'ai';
import { NextResponse } from 'next/server';


export const maxDuration = 10; 

const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by ||. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

export async function POST() {
  try {
    const result = streamText({
      model: groq('openai/gpt-oss-20b'), // confirm this against your /v1/models check
      prompt,
      temperature: 0.9,
    });
 
    return result.toTextStreamResponse();
  } catch (error) {
    if (APICallError.isInstance(error)) {
      return NextResponse.json(
        {
          name: error.name,
          status: error.statusCode,
          message: error.message,
        },
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