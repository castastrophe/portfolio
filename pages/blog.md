---
layout: general.html
---

:::band
<ul data-layout="auto-grid">
{%- for post in collections.post -%}
    <li style="display: contents;">
        <pfe-card>
            <h4><a href="{{ post.url }}">{{ post.data.title }}</a></h4>
            <p>{{ post.data.date }}</p>
        </pfe-card>
    </li>
{%- endfor -%}
</ul>
:::
