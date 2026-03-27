import DatabaseConnection from "../utilities/mysql/index.js";

const ME = 'Cassondra Roberts';

const PROJECTS = [{
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
}];

const EDUCATION = [
  {
    "title": "Bachelor of Science, Computer Science",
    "institution": "Meredith College",
    "start-date": 2008,
    "end-date": 2012
  }
];

const isMe = (user) => user.full_name === ME;

function formatEmployeeObject(user) {
  const rel = isMe(user) ? "me" : null;
  const contact = [];
  const socials = [];

  for (const key of ['social_url', 'phone', 'email_professional', 'portfolio_url', 'github_url', 'codepen_url', 'linkedin_url', 'youtube_url']) {
    if (!Object.keys(user).includes(key)) continue;
    const value = user[key];
    if (!value) continue;

    switch (key) {
      case 'phone':
        contact.push({
          "type": "phone",
          "value": value,
          "label": "Phone",
          "icon": "fa-solid fa-phone"
        });
        break;
      case 'email_professional':
        contact.push({
          "type": "email",
          "value": value,
          "label": "Email",
          "icon": "fa-solid fa-envelope"
        });
        break;
      case 'portfolio_url':
        contact.push({
          "type": "url",
          "value": value,
          "label": "Website",
          "icon": "fa-solid fa-globe"
        });
        break;
      case 'github_url':
        contact.push({
          "type": "url",
          "value": user.github_url,
          "label": "GitHub",
          "icon": "fa-brands fa-github"
        });
        socials.push({
          "url": user.github_url,
          "classes": "fa-brands fa-github",
          "label": "GitHub",
          "rel": rel
        });
        break;
      case 'codepen_url':
        contact.push({
          "type": "url",
          "value": user.codepen_url,
          "label": "Codepen",
          "icon": "fa-brands fa-codepen"
        });
        socials.push({
          "url": user.codepen_url,
          "classes": "fa-brands fa-codepen",
          "label": "Codepen",
          "rel": rel
        });
        break;
      case 'youtube_url':
        socials.push({
          "url": user.youtube_url,
          "classes": "fa-brands fa-youtube",
          "label": "YouTube",
          "rel": rel
        });
        break;
      case 'social_url':
        socials.push({
          "url": user.social_url,
          "classes": "fa-brands fa-mastodon",
          "label": "Mastodon",
          "rel": rel
        });
        break;
      case 'linkedin_url':
        contact.push({
          "type": "url",
          "value": user.linkedin_url,
          "label": "LinkedIn",
          "icon": "fa-brands fa-linkedin"
        });
        socials.push({
          "url": user.linkedin_url,
          "classes": "fa-brands fa-linkedin-in",
          "label": "LinkedIn",
          "rel": rel
        });
        break;
    }
  }

  return {
    name: user.full_name,
    title: user.title,
    email: user.email_professional,
    "contact": contact,
    "socials": socials,
    bio: user.short_biography,
  };
}
export default async function () {
  const connection = new DatabaseConnection({
		host     : process.env.MYSQL_HOST,
		port     : process.env.MYSQL_PORT,
		user     : process.env.MYSQL_USER,
		password : process.env.MYSQL_PASS,
		database : process.env.MYSQL_DB,
	});

  if (!connection) return {};

  const QUERY = 'SELECT * FROM employees';

  const [rows] = await connection.query(QUERY).catch((err) => {
    console.error(err);
  });

  await connection.close();

  if (!rows) return {};

  const me = rows.find(isMe) ? formatEmployeeObject(rows.find(isMe)) : {};
  const employees = rows.filter(row => !isMe(row)).map(formatEmployeeObject);

  return {
    ...me,
    "employees": employees,
    "training": EDUCATION,
    "projects": PROJECTS,
  };
};
