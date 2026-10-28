import * as z from "zod";

export const DEFAULT_CATEGORIES = ["개발/코드", "포트폴리오", "블로그", "SNS", "연락처"];

// Shared Zod schema for link validation
export const linkFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "링크 제목을 입력해주세요.")
      .min(2, "제목은 최소 2글자 이상 입력해야 합니다.")
      .max(50, "제목은 최대 50자까지 입력 가능합니다."),
    url: z
      .string()
      .trim()
      .min(1, "URL 주소를 입력해주세요.")
      .max(200, "URL은 최대 200자까지 입력 가능합니다.")
      .refine(
        (val) => {
          if (!val) return false;
          if (val.startsWith("mailto:")) {
            const email = val.replace("mailto:", "");
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          }
          let toCheck = val;
          if (!toCheck.startsWith("http://") && !toCheck.startsWith("https://")) {
            toCheck = `https://${toCheck}`;
          }
          try {
            const parsed = new URL(toCheck);
            return Boolean(
              parsed.hostname &&
              (parsed.hostname === "localhost" || parsed.hostname.includes(".")) &&
              !parsed.hostname.startsWith(".") &&
              !parsed.hostname.endsWith(".")
            );
          } catch {
            return false;
          }
        },
        {
          message: "올바른 URL(예: https://example.com) 형식을 입력해주세요.",
        }
      ),
    description: z
      .string()
      .max(100, "설명은 최대 100자까지 입력 가능합니다.")
      .optional(),
    category: z.string().min(1, "카테고리를 선택해주세요."),
    customCategory: z
      .string()
      .max(20, "카테고리명은 최대 20자까지 가능합니다.")
      .optional(),
    icon: z.string(),
    isPopular: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.category === "__custom__") {
        return Boolean(data.customCategory && data.customCategory.trim().length > 0);
      }
      return true;
    },
    {
      message: "새 카테고리명을 입력해주세요.",
      path: ["customCategory"],
    }
  );

export type LinkFormValues = z.infer<typeof linkFormSchema>;

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("mailto:")
  ) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
