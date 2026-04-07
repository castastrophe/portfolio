import '/js/components/a-band.js';
import '/js/components/a-card.js';
import '/js/components/a-container.js';
import '/js/components/a-note.js';
import '/js/components/tag-group.js';

document.addEventListener('DOMContentLoaded', () => {
    // Set up dynamic SVG
    const backgroundSVG = document.getElementById('background');
    if (backgroundSVG) {
        // Create random binary sets for each text element
        const binaryGroups = backgroundSVG.querySelectorAll('.binary');
        binaryGroups.forEach(binaryGroup => {
            const lines     = parseInt(binaryGroup.dataset.lines ?? 1),
                columns   = parseInt(binaryGroup.dataset.columns ?? 2),
                x         = parseInt(binaryGroup.dataset.x ?? 0),
                y         = parseInt(binaryGroup.dataset.y ?? 0),
                fontSize  = parseInt(binaryGroup.getAttribute('font-size') ?? 14);

            for (let i = 0; i < lines; i++) {
                const url = 'http://www.w3.org/2000/svg';
                const text = document.createElementNS(url, 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', y + (i * fontSize) + 4);

                for (let j = 0; j < columns; j++) {
                    let char = '';
                    for (let k = 0; k < 8; k++) {
                        char += Math.random() < 0.5 ? '1' : '0';
                    }
                    text.textContent += `${char} `;
                }

                binaryGroup.appendChild(text);
            }
        });
    }

    // Flag sticky elements as active

});
