import { authenticator } from 'otplib';

export function verifiyCode(userInputCode: string, secret: string): boolean {
    return authenticator.check(userInputCode, secret);
}