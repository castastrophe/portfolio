import { neon } from "@neondatabase/serverless";

export default async function () {
  const sql = neon( process.env.NEON_DATABASE_URL );
  const rows = await sql`
		SELECT name, phone, email, portfolio_url, github_url, linkedin_url, codepen_url, social_url, youtube_url
		FROM candidate
	`;
  const user = rows[ 0 ];
  return {
    "name": user.name,
    "contact": [
      {
        "type": "phone",
        "value": user.phone,
        "label": "Phone",
        "icon": "fa-solid fa-phone"
      },
      {
        "type": "email",
        "value": user.email,
        "label": "Email",
        "icon": "fa-solid fa-envelope"
      },
      {
        "type": "url",
        "value": user.portfolio_url,
        "label": "Website",
        "icon": "fa-solid fa-globe"
      },
      {
        "type": "url",
        "value": user.github_url,
        "label": "GitHub",
        "icon": "fa-brands fa-github"
      },
      {
        "type": "url",
        "value": user.codepen_url,
        "label": "Codepen",
        "icon": "fa-brands fa-codepen"
      },
      {
        "type": "url",
        "value": user.linkedin_url,
        "label": "LinkedIn",
        "icon": "fa-brands fa-linkedin"
      }
    ],
    "socials": [
      {
        "url": user.social_url,
        "classes": "fa-brands fa-mastodon",
        "label": "Mastodon",
        "rel": "me",
        "featured": true
      },
      {
        "url": user.linkedin_url,
        "classes": "fa-brands fa-linkedin-in",
        "label": "LinkedIn",
        "rel": "me",
        "featured": true
      },
      {
        "url": user.github_url,
        "classes": "fa-brands fa-github",
        "label": "GitHub",
        "rel": "me",
        "featured": true
      },
      {
        "url": user.codepen_url,
        "classes": "fa-brands fa-codepen",
        "label": "Codepen",
        "rel": "me",
        "featured": true
      },
      {
        "url": user.youtube_url,
        "classes": "fa-brands fa-youtube",
        "label": "YouTube",
        "rel": "me",
        "featured": true
      }
    ],
    "training": [
      {
        "title": "Bachelor of Science, Computer Science",
        "institution": "Meredith College",
        "start-date": 2008,
        "end-date": 2012
      }
    ],
    "projects": [ {
      "title": "Adobe",
      "headline": "Spectrum CSS",
      "url": "https://github.com/adobe/spectrum-css",
      "description": "A native HTML and modern CSS library that expresses the design direction of Adobe's Spectrum design system."
    }, {
      "title": "Adobe",
      "headline": "Spectrum Web Components",
      "url": "https://github.com/adobe/spectrum-web-components",
      "description": "A framework-agnostic component library leveraging web components to implement Adobe's Spectrum design system."
    }, {
      "title": "Red Hat",
      "headline": "PatternFly Elements",
      "url": "https://github.com/patternfly/patternfly-elements",
      "description": "A web component implementation of the PatternFly design system. Leverages the power of custom properties to create well-scoped elements that are fully customizable."
    } ],
  };
};
