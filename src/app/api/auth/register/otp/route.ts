import { forwardAuthAndSetCookies } from "../../_utils";

export async function POST(req: Request) {
  return forwardAuthAndSetCookies(req, "/auth/register/otp");
}
