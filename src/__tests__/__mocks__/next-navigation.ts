// Mock for next/navigation in vitest environment
import { vi } from "vitest";

export const useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
});
export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
