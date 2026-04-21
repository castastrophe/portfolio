document.addEventListener('DOMContentLoaded', () => {
    // Set up the open/close behavior for the detail/summary
    const tableOfContents = document.querySelector('.table-of-contents');
    if (!tableOfContents) return;

	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			const id = entry.target.getAttribute('id');
			if (entry.isIntersecting) {
				document.querySelector(`nav li a[href="#${id}"]`).parentElement.classList.add('active');
			} else {
				document.querySelector(`nav li a[href="#${id}"]`).parentElement.classList.remove('active');
			}
		});
	});

	// Track all sections that have an `id` applied
	document.querySelectorAll('.content > [id]').forEach((section) => {
        console.log(section);
		observer.observe(section);
	});
});
