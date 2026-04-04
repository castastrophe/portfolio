document.addEventListener('DOMContentLoaded', () => {
    // Set up the open/close behavior for the detail/summary
    const detailEl = document.querySelector('.table-of-contents');
    if (!detailEl) return;

    const summaryEl = detailEl.querySelector('summary');
    summaryEl.addEventListener("click", () => {
        // toggle the detail container on click
        detailEl.toggleAttribute("open", detailEl.hasAttribute("open"));
    });

    detailEl.querySelectorAll('a').forEach(link => {
        link.addEventListener("click", () => {
            // close the detail container on click after a short delay
            setTimeout(() => {
            detailEl.toggleAttribute("open", detailEl.hasAttribute("open"));
            }, 100);
        });
    });

    // close the detail container on click outside of the detail container or the summary
    document.addEventListener("click", (evt) => {
        if (detailEl.hasAttribute("open") && (evt.target !== detailEl && evt.target !== summaryEl)) {
            detailEl.toggleAttribute("open", false);
        }
    }, { capture: true });
});
