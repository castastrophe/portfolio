import { Inngest } from "inngest";

const inngest = new Inngest({ id: process.env.INNGEST_APP_ID });

/**
 * This function is triggered when a new resume variant is added to the database.
 * It will refresh the custom content for the resume page.
 * @type {import('inngest').createFunction}
 */
export default inngest.createFunction(
  { id: "refresh-custom-content" },
  { event: "db/resume_variants.updated" },
  async ({ event, step }) => {
    await step.run("trigger-build-hook", async () => {
        if (!process.env.NETLIFY_BUILD_HOOK_URL) return;
        const response = await fetch(NETLIFY_BUILD_HOOK_URL, {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error(`Netlify build hook failed: ${response.statusText}`);
          }
          return { success: true, message: "Netlify build triggered successfully" };
        });

        return { event, body: "Build initiated" };
    }
)
