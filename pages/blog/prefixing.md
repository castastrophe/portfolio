---
layout: post.html
tags: 
    - post
title: "Prefixing: the eternal question"
date: 2016-06-30
---

In the world of design systems, prefixing has become the norm; and with good reason. Prefixing offers a way to quickly identify from which codebase a particular style or element derives so we can easily debug environments with multiple sources. I've seen this advantage win out time and time again on redhat.com, where we have pages built from Drupal templates, pattern systems, web components, and a smattering of code from custom libraries.

## What do we risk by not prefixing?

My spouse is also a developer and shared this great example with me of what we risk when we don't use prefixing in our code. He was building an animation for arcade.redhat.com based on this example from MDN. When he opened the page in other browsers it looked great, but in Firefox the animation wasn't working. After lots of debugging, he narrowed it down to a conflict in animation naming with his favorite password manager plugin, KeePass. Neither animation was using prefixing and had incidentally chosen the same name, leading to this unfortunate collision. (He opened a PR.)

## What can we prefix?

Down to brass tacks; what kinds of things can be prefixed? (Notice I say can and not necessarily should.)

- Classes
- IDs
- Animations
- Custom element tag names (they require a dash anyway so why not start with your library's prefix?)
- Attributes (definite pros and cons to taking prefixing down this far but I'll address them below)
- Custom properties (this is a whole topic unto itself)

## Naming is hard

Design systems are my bread and butter so my first example comes from our webrh library; webrh is a set of twig-based templates using schema to define the CMS UI. The rendered results for the call-to-action component looks like:

<pfe-codeblock code-language="html" code-line-numbers code-theme="dark">
<pre codeblock-container><code>
&lt;div class="rh-cta--component" align="left" type="primary"&gt;
    &lt;a class="rh-cta-link" href="#" title="Lorem ipsum"&gt;This is my test&lt;/a&gt;
&lt;/div&gt;
</code></pre>
</pfe-codeblock>

<caption><small>Example of rh-prefixed classes inside the webrh call-to-action component.</small></caption>

In webrh, we prefix all our classes with rh. This was one of the early design systems at Red Hat, so we were able to corner the rh namespace, but normally I wouldn't recommend going quite so generic because you're likely to run into conflicts with other projects choosing the same prefix. Prefixing becomes a lot less useful if all our codebases pick the same prefix!

If you poke around pages on dotcom, you'll see a lot of rh prefixed classes: rh-group--layout , rh-standard-header--component, rh-raw , etc. Let's look more closely at an rh-generic--component we might see on the site:

<pfe-codeblock code-language="html" code-line-numbers code-theme="dark">
<pre codeblock-container><code>
&lt;div class="rh-generic--component"&gt;
    &lt;p&gt;We've been here for more than 25 years, and we're here to help you face your business challenges head-on.&lt;/p&gt;
    &lt;div class="rc-cta-secondary"&gt; &lt;a href="#"&gt;Build a hybrid cloud&lt;/a&gt; &lt;/div&gt;
    &lt;div class="rc-cta-secondary"&gt; &lt;a href="#"&gt;Develop cloud-native apps&lt;/a&gt; &lt;/div&gt;
&lt;/div&gt;
</code></pre>
</pfe-codeblock>

<figcaption>Example of nested prefixing.</figcaption>

Inside our rh-generic--component class we see two rc-cta-secondary elements. The rh-generic--component is the webrh design system's wrapper class for the CMS WYSIWYG. Inside the WYSIWYG, Drupal offers a way to inject custom styles via a drop-down interface and those custom styles live inside the WYSIWYG module. Most of our rc prefixed classes on dotcom originate from Drupal. Now when we're debugging styles, if we see an issue with an rc prefixed call-to-action on the site, we know to go to our Drupal codebase rather than our design system, even though visually, they might look the same to the end-user.
This scales beautifully too. We have pages on dotcom featuring patterns with WYSIWYG content layered next to shared nodes and raw custom bands with styles originating from our internal studio team or even external agencies. These prefixes make it easy for even non-developers to triage where bug reports should be routed.

## When shouldn't we prefix?

Alright so I've convinced you, right?

<caption>PREFIX ALL THE THINGS (meme with very energetic cartoon)</caption>

Join the prefix army!

Let's see this energy in action:

<pfe-codeblock code-language="html" code-line-numbers code-theme="dark">
<pre codeblock-container><code>
&lt;div class="rh-cta--component" rh-align="left" rh-type="primary" id="rh-custom-component"&gt;
    &lt;a class="rh-cta-link" href="#" title="Lorem ipsum"&gt;This is my test&lt;/a&gt;
&lt;/div&gt;
</code></pre>
</pfe-codeblock>

<caption>Highly prefixed example of templated code</caption>

Okay, this isn't terrible but imagine this everywhere on the page. It's not the best. It definitely ensures maximum protection from conflicting code but a lot less readable. My suggestion is to drop attribute prefixing but make a contract with publishers to your codebase that all their styles must be attached to a class. That means none of this:

<pfe-codeblock code-language="css" code-line-numbers code-theme="dark">
<pre codeblock-container><code>
[align="left"] {
    background-color: hotpink;
    text-align: center;
}
</code></pre>
</pfe-codeblock>

<caption>CSS naughtiness at it's best</caption>

That's just mean. Honestly, don't apply random styles to an attribute that isn't related to the name of the attribute or what the value is. In all seriousness, even if you're just applying text-align: left to this attribute, you can't be sure all uses of [align="left"] relate only to text. Maybe someone else is using it on an element to left align their flex layout. This is why I suggest, no matter how intuitive you think it is, please include the class context with your styles.

<pfe-codeblock code-language="css" code-line-numbers code-theme="dark">
<pre codeblock-container><code>
.rh-cta--component[align="left"] {
    text-align: left;
}
</code></pre>
</pfe-codeblock>

So much better, I feel safe now.

## Web components

Drum roll please...the real question, do we prefix web components?
Well, the obvious option for prefixing web components is the tag name. It requires a dash anyway so why not carve out that first text string for your library's prefix? The likelihood that there are multiple web component libraries in place on your site is probably slim, but prefixing the tag takes away part of the struggle with naming simple web components like button or chip when you can do pfe-button or pfe-chip and not have to make up a more complicated name just to get that dash in place.

It depends

Where else do web components need prefixing? It all depends on your approach.

There are a lot of different ways to come at rendering a web component. Some components fetch data and thus only use the shadow DOM for rendering, while others function as a means of gently upgrading and styling light DOM content.

Let's look at the first approach--a component that has its template entirely in the shadow DOM, no slots, no copying content from the light DOM:

This component, pfe-avatar, accepts a name as an attribute and uses that to programmatically create a unique pattern to display as an avatar with an image is not provided. No light DOM intervention or styling necessary. Our entire template looks like this (minus the style tag):

<pfe-codeblock code-language="html" code-line-numbers code-theme="dark">
<pre codeblock-container><code>
&lt;canvas&gt;&lt;/canvas&gt;
&lt;img&gt;
</code></pre>
</pfe-codeblock>

Do we really need the canvas or img tags to include class names or IDs? Since they're in the shadow DOM and protected from any external undue influence, my advice would be no. The shadow DOM is appropriately semantic and there are no duplicate tags to contend with so prefixing doesn't necessarily make sense.

Even attributes on this component like pattern and shape don't require prefixes because they don't collide with any global HTML attributes and there's no way for external styles attached to pattern="squares" to bleed into the shadow DOM.

Let's look at an example where the web component is responsible for providing gentle styles to the light DOM. We can take a couple of approaches to accomplish this:

1.  Applying styles from the shadow DOM to the light DOM using :slotted . This is a limited approach in that :slotted only has access to the direct children of the component. How do we, for example, style the a tag nested inside the p tag?
2.  Applying styles by copying the style tag from the shadow template to the light DOM and wrapping those styles in a prefixed class such as .pfe-c-content which is applied to the web component on upgrade. These styles are fairly weak in that external styles can override them but that might be desirable to allow customizations.<br/><caption>Example of a web component applying styles to light DOM</caption>
3.  For those situations where you want to protect your light DOM fully from external influence, you can go so far as to copy the entire contents of the component into the shadow DOM and leave off the slot. No prefixing is needed here in the stylesheet because the contents are fully scoped. Any classes or external styles applied to the light DOM will no longer work once migrated.<br/><caption>Example of a web component apply scoped styles using shadow DOM</caption>

## Play nice

Whether you choose to prefix or not, it often boils down to your code being able to coexist peacefully with other projects. Other than that, go forth and conquer! You got this.
