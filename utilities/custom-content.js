/**
 * This is a utility for setting and clearing cookies on the resume page.
 * The query parameters are stored as a cookie so that if the user reloads the page, the custom content is still displayed.
 *
 * @param {import('@netlify/functions').Request} request - The request object
 * @param {import('@netlify/functions').Context} context - The context object
 * @returns {import('@netlify/functions').Handler} The response object
 */
export default async function (request, context) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("v");
  const cookies = context.cookies;

  // A query parameter to clear the cookies if wanted
  if (url.searchParams.get("cookies") === "clear") {
    cookies.delete("customized-content");
  }

  // If no slug is provided, check if the cookie is set
  if (!slug) {
    const cookie = cookies.get("customized-content");
    if (cookie && cookie !== "undefined" && cookie !== "null") {
      return getAlternateContent(context, cookie);
    }

    // If no cookie is set, return with no change
    return context.next().then((response) => {
      return response;
    });
  }

  // Start by setting a new cookie with the slug value
  cookies.set({
    name: "customized-content",
    slug,
  });

  // Next we return the response with the customized content from {slug}.html
  const response = await getAlternateContent(context, slug);
  return response;
}

/**
 * The config object is used to specify the path of the edge function.
 * @type {import('@netlify/functions').Config}
 */
export const config = {
  path: "/resume/",
};


/**
 * Get the alternate content for a given slug.
 * @param {string} slug - The slug of the content to get.
 * @returns {Promise<Response>} The response object.
 */
async function getAlternateContent(context, slug = "index") {
  return fetch(`${context.url.origin}/resume/${slug}.html`, {
    method: "GET",
  });
}
