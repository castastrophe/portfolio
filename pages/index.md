---
layout: general
---

<pfe-band id="about" use-grid>
    <div class="header">
        <div class="image-embed" data-type="profile">
            <div class="image-embed-container">
                <img class="image-embed-img" src="./img/profile.jpg">
            </div>
        </div>
        <h2 class="header-headline accent shown-text">About castastrophe</h2>
        <h2 class="header-headline accent hidden-text">Cassondra Roberts</h2>
        <p class="header-summary">I am a <b>passionate</b> front-end architect &amp; technical lead at <a
                href="https://www.redhat.com/en/about/company">Red&nbsp;Hat</a> on the Digital Marketing Strategy &amp;
            Design team, where we build the design system that powers many of Red&nbsp;Hat's web assets.</p>
        <p class="header-summary"><b class="extra">Nothing makes me happier than exploring new technologies and
                implementing
                highly-optimized, clean solutions to complex problems.</b></p>
        <p class="header-summary"><b>Developer experience and accessibility are deeply important to me</b> and these
            values
            guide the code that I produce and influence. One of the most enjoyable aspects of my job is open source
            community management; engaging with and connecting the contributors to many of Red Hat's open initiatives.
        </p>
    </div>
    <section data-layout="flex-centered">
        <pfe-card class="quote shown">
            <blockquote id="quote">
                <div class="quote-container" data-text-align="right">
                    <p class="quote-quotation">You're not going to learn code by passively watching someone
                        else write it. You have to get into it, get really tangled up in it, and ask how you
                        could make it better.</p>
                </div>
                <p class="quote-attribution">Collaborative Problem Solver<br>
                    <span>
                        <a href="https://www.meredith.edu/goingstrong/cas-roberts">Meredith Magazine</a>
                    </span>
                </p>
            </blockquote>
        </pfe-card>
        <pfe-card color="accent" tilt-on="hover" class="featured">
            <h3 class="card-header-title">Design system</h3>
            <h4 class="card-header-headline" style="font-size: 22px;"><a
                    href="https://github.com/patternfly/patternfly-elements" title="Click to view project">PatternFly
                    Elements</a></h4>
            <div class="card-body">
                <div class="content">
                    <p>This is a web component implementation of the Red Hat design system. It leverages the
                        encapsulation of ShadowDOM and the
                        power of custom properties to create well-scoped elements that are still
                        designer-friendly. Elements are accessible, context-aware, and framework-friendly!
                    </p>
                </div>
            </div>
            <pfe-cta slot="pfe-card--footer">
                <a class="cta-link" href="https://github.com/patternfly/patternfly-elements"
                    title="Click to view project" data-cta-type="secondary">View the source code</a>
            </pfe-cta>
        </pfe-card>
    </section>
</pfe-band>

<pfe-band id="teaser" color="accent" data-padding="half">
    <div class="video-embed" data-text-align="center">
        <div class="video-embed-details" data-ux-state="visible">
            <div class="group" data-layout="8 4">
                <div class="header" data-text-align="sm-md--center">
                    <h3 class="promo-headline"><a
                            href="https://events.drupal.org/seattle2019/sessions/unlocking-design-design-system-custom-properties">Unlocking
                            design in a design system with custom properties</a>
                    </h3>
                    <p class="header-summary">DrupalCon 2019 | Seattle, WA</p>
                </div>
                <div data-align="both">
                    <pfe-cta data-cta-type="video-play" style="font-size: 20px;">
                        <a class="cta-link" data-popup="youtube" href="https://www.youtube.com/embed/xH2MmVNuSe4">Watch
                            now</a>
                    </pfe-cta>
                </div>
            </div>
        </div>
    </div>
</pfe-band>

<pfe-band class="hidden">
    <h2 slot="pfe-band--header" class="header-title">Experience & passion</h2>
    <p slot="pfe-band--header" class="header-summary">I've spent 7+ years at Red Hat investing in building design systems that work for designers, developers, content writers, and users alike. <b>My most valuable tool in this endeavor has always been active listening.</b> I ask a lot of questions and work hard to understand what we're really trying to solve, for the business and for the user. Making tools that are fun and easy for developers is important to me and hopefully makes what I build an obvious choice over the option to "reinvent the wheel". If I do my job right, I let developers and designers work on cutting-edge work instead of having to construct the building blocks from stratch.</p>
    {% include "resume.njk" with resume %}
</pfe-band>

<pfe-band data-width="full" id="coding">
    <h2 slot="pfe-band--header" class="header-title">Coding projects</h2>
    <div class="group" data-layout="auto-grid">
        <pfe-card pfe-border>
            <h3 class="card-header-title">Single page app</h3>
            <h4 class="card-header-headline accent" style="font-size: 22px;"><a
                    href="https://github.com/RedHatOfficial/RedHatOfficial.github.io" title="Click to view project">Red
                    Hat on GitHub</a></h4>
            <div class="card-body">
                <div class="content">
                    <p>This is the official GitHub page for Red Hat open source projects on GitHub. I
                        served as the lead developer in the construction of this page in conjunction
                        with a team of designers and developers at Red Hat. I continue to serve as the
                        community liason for this and several other open source projects by Red Hat. You can
                        preview this page <a href="https://redhatofficial.github.io/#!/main">here</a>.</p>
                </div>
            </div>
            <pfe-cta slot="pfe-card--footer">
                <a class="cta-link" href="https://github.com/RedHatOfficial/RedHatOfficial.github.io"
                    title="Click to view project" data-cta-type="secondary">View the source code</a>
            </pfe-cta>
        </pfe-card>
        <pfe-card pfe-border>
            <h3 class="card-header-title">Preview tool</h3>
            <h4 class="card-header-headline accent" style="font-size: 22px;"><a
                    href="https://github.com/PatternBuilder/pattern-kit" title="Click to view project">PatternKit</a>
            </h4>
            <div class="card-body">
                <div class="content">
                    <p>PatternKit is a preview tool for our internal design system. It utilizes Twig,
                        Sass, JavaScript and JSON schemas to create a suite of components. The tool
                        let's you preview the component and edit the test data in the schema for a live
                        preview.</p>
                </div>
            </div>
            <pfe-cta slot="pfe-card--footer">
                <a class="cta-link" href="https://github.com/PatternBuilder/pattern-kit" title="Click to view project"
                    data-cta-type="secondary">View the source code</a>
            </pfe-cta>
        </pfe-card>
        <pfe-card pfe-border>
            <h3 class="card-header-title">Build tool</h3>
            <h4 class="card-header-headline accent" style="font-size: 22px;"><a
                    href="https://github.com/castastrophe/gulp-custom-include"
                    title="Click to view project">gulp-custom-include</a></h4>
            <div class="card-body">
                <div class="content">
                    <p>I wrote this plugin because the existing include plugins for Gulp didn't have
                        quite the flexibility I wanted in the formatting of the include statements.
                        Especially helpful if you have an existing library that already has it's own
                        include syntax.</p>
                </div>
            </div>
            <pfe-cta slot="pfe-card--footer">
                <a class="cta-link" href="https://github.com/castastrophe/gulp-custom-include"
                    title="Click to view project" data-cta-type="secondary">View the source code</a>
            </pfe-cta>
        </pfe-card>
    </div>
</pfe-band>

<pfe-band id="design">
    <h2 slot="pfe-band--header" class="header-title">Design</h2>
    <p slot="pfe-band--header" class="header-summary">I've moved away from full-page design in the last few years to
        focus
        on systems architecture. When I was involved in these design projects though, I loved working with stakeholders
        to
        get at the heart of what they needed from their page; asking the right questions to get to the real problem and
        make
        something of which we both could be proud.</p>
    <div class="group" data-layout="6 6">
        <pfe-card>
            <div class="image-embed shown" overflow="top">
                <div class="image-embed-container">
                    <a href="./img/2016-07-24_redhat_learning-subscription.png" class="popup-link">
                        <img class="image-embed-img" src="./img/2016-07-24_redhat_learning-subscription_screenshot.png">
                    </a>
                </div>
            </div>
            <div class="portfolio-details">
                <div class="image-embed hidden">
                    <div class="image-embed-container">
                        <a href="./img/2016-07-24_redhat_learning-subscription.png" class="popup-link">
                            <img class="image-embed-img"
                                src="./img/2016-07-24_redhat_learning-subscription_screenshot.png">
                        </a>
                        <p class="image-embed-caption">Click to zoom</p>
                    </div>
                </div>
                <div>
                    <h3 class="card-header-headline" style="margin: 0 0 5px;">PAGE | Red Hat Learning Subscription</h3>
                    <p class="card-header-summary">2016 July 24</p>
                    <pfe-cta>
                        <a href="https://www.redhat.com/en/services/training/learning-subscription"
                            title="Click to view page at source">View the source</a>
                    </pfe-cta>
                </div>
            </div>
        </pfe-card>
        <pfe-card>
            <div class="image-embed shown" pfe-overflow="top">
                <div class="image-embed-container">
                    <a href="./img/2016-05-20_redhat_summit.png" class="popup-link">
                        <img class="image-embed-img" src="./img/2016-05-20_redhat_summit_screenshot.png">
                    </a>
                </div>
            </div>
            <div class="portfolio-details">
                <div class="image-embed hidden">
                    <div class="image-embed-container">
                        <a href="./img/2016-05-20_redhat_summit.png" class="popup-link">
                            <img class="image-embed-img" src="./img/2016-05-20_redhat_summit_screenshot.png">
                        </a>
                        <p class="image-embed-caption">Click to zoom</p>
                    </div>
                </div>
                <div>
                    <h3 class="card-header-headline" style="margin: 0 0 5px;">MICROSITE | Red Hat Summit
                    </h3>
                    <p class="card-header-summary">2016 May 20</p>
                    <pfe-cta>
                        <a href="https://www.redhat.com/en/summit" title="Click to view site at source">View the
                            source</a>
                    </pfe-cta>
                </div>
            </div>
        </pfe-card>
    </div>
</pfe-band>

<pfe-band color="accent" data-width="full" id="presentations">
    <h2 slot="pfe-band--header" class="header-title">Presentations</h2>
    <div data-width="overflow">
        <div class="group" data-layout="overflow-grid">
            <pfe-card color="transparent">
                <div class="video-embed-iframe-container" pfe-overflow="top right left">
                    <iframe src="https://www.youtube.com/embed/xH2MmVNuSe4" frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
                </div>
                <h3 class="card-header-title">DrupalCon 2019</h3>
                <h4 class="card-header-headline" style="font-size: 22px;">
                    <a href="https://events.drupal.org/seattle2019/sessions/unlocking-design-design-system-custom-properties"
                        title="Click to read more about this presentation">Unlocking design in a design system with
                        custom
                        properties</a>
                </h4>
                <p>A deep-dive on how to leverage custom properties in a design system.</p>
                <pfe-cta slot="pfe-card--footer">
                    <a class="cta-link"
                        href="https://events.drupal.org/seattle2019/sessions/unlocking-design-design-system-custom-properties"
                        title="Click to read more about this presentation" data-cta-type="secondary">View the full
                        description</a>
                </pfe-cta>
            </pfe-card>
            <pfe-card color="transparent">
                <div class="video-embed-iframe-container" pfe-overflow="top right left">
                    <iframe src="https://www.youtube.com/embed/Akn6keIYZ3k" frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
                </div>
                <h3 class="card-header-title">DrupalCon 2019</h3>
                <h4 class="card-header-headline" style="font-size: 22px;"><a
                        href="https://events.drupal.org/seattle2019/sessions/make-web-development-fun-again-web-components"
                        title="Click to read more about this presentation">Make web development fun again, with
                        web components!</a>
                </h4>
                <p>A joint presentation with Penn State on how web components can make development workflows fun
                    and efficient.</p>
                <pfe-cta slot="pfe-card--footer">
                    <a class="cta-link"
                        href="https://events.drupal.org/seattle2019/sessions/make-web-development-fun-again-web-components"
                        title="Click to read more about this presentation" data-cta-type="secondary">View the
                        full description</a>
                </pfe-cta>
            </pfe-card>
            <pfe-card color="transparent">
                <div class="video-embed-iframe-container" pfe-overflow="top right left">
                    <iframe src="https://www.youtube.com/embed/p3y0ljTr8YQ" frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
                </div>
                <h3 class="card-header-title">DrupalCon 2019</h3>
                <h4 class="card-header-headline" style="font-size: 22px;"><a
                        href="https://events.drupal.org/nashville2018/sessions/one-these-things-not-other-identifying-patterns-mock"
                        title="Click to read more about this presentation">One of these things is not like the
                        other; identifying
                        patterns in a mock-up</a></h4>
                <p>An example-rich talk about how to break out mock-ups into patterns for maximum reusability.
                </p>
                <pfe-cta slot="pfe-card--footer">
                    <a class="cta-link"
                        href="https://events.drupal.org/nashville2018/sessions/one-these-things-not-other-identifying-patterns-mock"
                        title="Click to read more about this presentation" data-cta-type="secondary">View the
                        full description</a>
                </pfe-cta>
            </pfe-card>
            <pfe-card color="transparent">
                <div class="video-embed-iframe-container" pfe-overflow="top right left">
                    <iframe src="https://www.youtube.com/embed/8Yyklb78S00" frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
                </div>
                <h3 class="card-header-title">NCDevCon 2016</h3>
                <h4 class="card-header-headline" style="font-size: 22px;"><a
                        href="https://www.youtube.com/embed/8Yyklb78S00" title="Click to watch the presentation">Reduce,
                        reuse, recycle: Modular CSS
                    </a></h4>
                <p>Creating highly-optimized patterns by increasing reusability in your codebase, thus reducing
                    the size of your output.</p>
            </pfe-card>
        </div>
    </div>
</pfe-band>

<pfe-band id="tools" data-padding="half" class="shown">
    <div>
        <h3 class="header-title">Tools</h3>
        <h4 class="header-headline accent">How the site was made</h4>
        <p class="header-summary">There are so many amazing tools out there which make building a site
            quick and easy. Preprocessors like Sass are invaluable ways to incorporate loops and logic
            into your styles and build tools like Gulp.js make producing production-ready code a snap.
        </p>
    </div>
    <section data-layout="flex">
        <pfe-cta class="small" priority="primary">
            <a href="https://github.com/patternfly/patternfly-elements/">Web components</a>
        </pfe-cta>
        <pfe-cta class="small" priority="secondary">
            <a href="https://gulpjs.com/">Gulp</a>
        </pfe-cta>
        <pfe-cta class="small" priority="secondary">
            <a href="https://sass-lang.com/">Sass</a>
        </pfe-cta>
        <pfe-cta class="small" priority="secondary">
            <a href="https://dimsemenov.com/plugins/magnific-popup">Magnific pop-up</a>
        </pfe-cta>
    </section>
</pfe-band>

<pfe-band data-padding="half" class="shown">
    <div class="content" data-align="center">
        <p><small>Red Hat is a registered trademark of Red Hat, Inc. in the United States and other countries. <a
                    class="cta-link" href="https://www.redhat.com/en/about/trademark-guidelines-and-policies">Learn more
                    about their trademark guidelines and policies.</a></small></p>
    </div>
</pfe-band>
