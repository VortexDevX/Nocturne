import { test, expect } from "@playwright/test";

test.describe("reader upload flow", () => {
  test("opens reader after TXT upload", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "sample.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        [
          "Chapter 1",
          "",
          "This is a sample paragraph from Nocturne reader.",
          "It should render correctly after upload.",
        ].join("\n"),
        "utf-8"
      ),
    });

    await expect(page).toHaveURL(/\/reader/);
    await expect(
      page.getByText("This is a sample paragraph from Nocturne reader.")
    ).toBeVisible();
  });

  test("handles large TXT upload without sessionStorage quota errors", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/");

    const largeChunk = "Large chapter content for stress testing uploads.\n";
    const largeContent = `Chapter X\n\n${largeChunk.repeat(180_000)}`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "large.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(largeContent, "utf-8"),
    });

    await expect(page).toHaveURL(/\/reader/);
    await expect(page.getByText("Large chapter content for stress testing uploads.").first()).toBeVisible();
  });
});
