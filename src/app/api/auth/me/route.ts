import { forwardAuthGet } from "../_utils";

export async function GET(req: Request) {
  return forwardAuthGet(req, "/auth/me");
}
