import { forwardAuthRequest } from "../../../_utils";

export async function POST(req: Request) {
  return forwardAuthRequest(req, "/auth/login/otp/resend");
}
