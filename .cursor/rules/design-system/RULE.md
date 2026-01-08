---
globs: *.webc, *.html, *.scss
description: This rule provides guidance for constructing front-end web content according to the design standards.
alwaysApply: true
---

This rule provides standards for front-end components:

Best resources for HTML, CSS, and JS standards:

- HTML: https://developer.mozilla.org/en-US/docs/Web/HTML
- CSS: https://developer.mozilla.org/en-US/docs/Web/CSS
- JS: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- Sass: https://sass-lang.com/documentation/

Do not:
- Suggest tailwind or React solutions
- Do not use lit, lit-html, or svelte for component syntax

Do:
- Prefer vanilla web APIs over additional dependencies or plugins
- Use https://raw.githubusercontent.com/web-padawan/awesome-web-components/refs/heads/main/README.md for questions regarding web components
- Use this as a reference for odd bugs and edge cases: https://bennypowers.dev/posts/webc-impressions/

When working in _includes/components directory:

    - Always use WebC best practices (https://www.11ty.dev/docs/languages/webc/)
    - Always prefer vanilla web components: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
    - Use JSDoc comments to document web component classes

When working in the pages directories:

- Prefer components defined in the _includes/components directory

Examples of well-written web components:

- https://nordhealth.design/components/
- https://shoelace.style/