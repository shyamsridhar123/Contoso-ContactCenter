import { test, expect } from "@playwright/test"

test.describe("Call Listen Panel E2E", () => {
  test("dashboard loads and shows live calls", async ({ page }) => {
    await page.goto("http://localhost:3000")

    // Dashboard heading visible
    const heading = page.locator("h1")
    await expect(heading).toBeVisible({ timeout: 10000 })
    await expect(heading).toContainText("Good morning")

    // Live indicator visible
    await expect(page.getByText("Live")).toBeVisible()
  })

  test("live call cards render with monitor buttons", async ({ page }) => {
    await page.goto("http://localhost:3000")
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 })

    // Call cards should be visible in Overview tab
    const callCards = page.locator('[class*="rounded-xl glass p-3"]')
    await expect(callCards.first()).toBeVisible({ timeout: 5000 })

    // Eye button should exist on call cards
    const eyeButtons = page.locator('button:has(svg.lucide-eye)')
    const count = await eyeButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test("clicking Eye button opens call listen panel", async ({ page }) => {
    await page.goto("http://localhost:3000")
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 })

    // Click the first Eye button
    const eyeButton = page.locator('button:has(svg.lucide-eye)').first()
    await expect(eyeButton).toBeVisible({ timeout: 5000 })
    await eyeButton.click()

    // Sheet panel should slide in — look for "Live Transcript" heading
    const transcriptHeading = page.getByText("Live Transcript")
    await expect(transcriptHeading).toBeVisible({ timeout: 5000 })

    // AI Assist section should be visible
    const aiAssist = page.getByText("AI Assist")
    await expect(aiAssist).toBeVisible()

    // Supervisor controls should be visible
    await expect(page.getByText("Whisper")).toBeVisible()
    await expect(page.getByText("Barge-in")).toBeVisible()

    // Monitoring indicator should appear
    await expect(page.getByText("Monitoring")).toBeVisible()
  })

  test("transcript streams in real-time after panel opens", async ({ page }) => {
    await page.goto("http://localhost:3000")
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 })

    // Open the panel
    const eyeButton = page.locator('button:has(svg.lucide-eye)').first()
    await expect(eyeButton).toBeVisible({ timeout: 5000 })
    await eyeButton.click()

    // Wait for transcript lines to appear (streaming at 300ms per word)
    await expect(page.getByText("Live Transcript")).toBeVisible({ timeout: 5000 })

    // Wait for at least one transcript line with agent or customer indicator
    const transcriptLine = page.locator('[class*="rounded-xl px-3 py-2 text-xs"]')
    await expect(transcriptLine.first()).toBeVisible({ timeout: 8000 })
  })
})
