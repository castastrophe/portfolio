document.addEventListener("DOMContentLoaded", () => {
    const filterLinks = document.querySelectorAll(".tag-filter");
    const cards = document.querySelectorAll("a-card[data-tags]");

    function applyFilter(tag) {
        filterLinks.forEach(link => {
            const matches = (!tag && link.dataset.tag === "") || tag === link.dataset.tag;
            if (matches) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });

        cards.forEach(card => {
            if (!tag) {
                card.hidden = false;
            } else {
                const tags = card.dataset.tags ? card.dataset.tags.split(",").map(t => t.trim()) : [];
                card.hidden = !tags.includes(tag);
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
    applyFilter(params.get("tag"));

    filterLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const tag = link.dataset.tag || null;

            const url = new URL(window.location.href);
            if (tag) url.searchParams.set("tag", tag);
            else url.searchParams.delete("tag");
            history.pushState({ tag }, "", url);

            applyFilter(tag);
        });
    });

    window.addEventListener("popstate", () => {
        const params = new URLSearchParams(window.location.search);
        applyFilter(params.get("tag"));
    });
});
