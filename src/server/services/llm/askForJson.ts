import "server-only";
import type { z } from "zod";
import { LlmGatewayError } from "@/server/errors/LlmGatewayError";
import { askLlmGateway } from "@/server/services/llm/askLlmGateway";
import type { JsonQuestion } from "@/types/JsonQuestion";

export async function askForJson<Shape extends z.ZodType>(
  question: JsonQuestion,
  shape: Shape,
  isGoodEnough: (answer: z.output<Shape>) => boolean = () => true,
) {
  let usableAnswer: z.output<Shape> | undefined;
  for (const attempt of [1, 2, 3]) {
    const reply = await askLlmGateway(question.instructions, question.request, question.maxTokens);
    const answer = readAnswer(reply, shape);
    if (answer !== undefined && isGoodEnough(answer)) {
      return answer;
    }
    usableAnswer = answer ?? usableAnswer;
    console.warn(`LLM Gateway reply ${attempt} was ${answer === undefined ? "not valid JSON for the shape" : "not good enough"}`);
  }
  if (usableAnswer !== undefined) {
    return usableAnswer;
  }
  throw new LlmGatewayError("the reply was not valid three times in a row");
}

function readAnswer<Shape extends z.ZodType>(reply: string, shape: Shape): z.output<Shape> | undefined {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return undefined;
  }
  const answer = shape.safeParse(readJson(reply.slice(start, end + 1)));
  return answer.success ? answer.data : undefined;
}

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
