import { forwardAuthRequest } from "../_utils";

export async function GET(req: Request) {
  return forwardAuthRequest(req, "/auth/me");
}
