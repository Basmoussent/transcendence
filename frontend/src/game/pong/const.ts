import { Paddle } from "./paddle";
import { PaddleAI } from "./paddle-ai";

export const PADDLE_OFFSET = 2; // ca correspond au contour de mes paddles
export type Player = Paddle | PaddleAI | null;