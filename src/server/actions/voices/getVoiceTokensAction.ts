"use server";

import { z } from "zod";
import { createVoiceToken } from "@/server/services/voices/createVoiceToken";

export async function getVoiceTokensAction(count: number) {
  const checkedCount = TokenCount.parse(count);
  const tokenRequests = Array.from({ length: checkedCount }, () => createVoiceToken());
  return Promise.all(tokenRequests);
}

const TokenCount = z.number().int().min(1).max(8);
