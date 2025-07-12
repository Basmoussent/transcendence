import { Paddle } from "./multiplayer/multi-paddle";
import { PaddleAI } from "./multiplayer/multi-paddle-ai";

export const PADDLE_OFFSET = 2; // ca correspond au contour de mes paddles
export type Player = Paddle | PaddleAI | null;
export const PADDLE1_COLOR = '#914D76'
export const PADDLE2_COLOR = '#4a90e2'
export const PADDLE3_COLOR = '#A4AF69'
export const PADDLE4_COLOR = '#F991CC'
export const BALL_BASE_SPEED = 8
