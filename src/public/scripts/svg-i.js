class SVGI extends HTMLElement {
    static get observedAttributes() { return ['src', 'style', 'width', 'height']; }

    connectedCallback() {
        this._load();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) this._load();
    }

    async _load() {
        const src = this.getAttribute('src');
        if (!src) return;

        try {
            const res = await fetch(src, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status} ${res.statusText}`);
            const text = await res.text();
            const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
            let svg = parsed.querySelector('svg');
            if (!svg) throw new Error('No <svg> element found in ' + src);

            // Import into current document to avoid ownerDocument issues
            svg = document.importNode(svg, true);

            // Transfer attributes from the host element to the svg (except src)
            for (const { name, value } of Array.from(this.attributes)) {
                if (name === 'src') continue;

                if (name === 'style') {
                    const hostStyle = value.trim();
                    const svgStyle = svg.getAttribute('style') || '';
                    const merged = svgStyle ? svgStyle + ';' + hostStyle : hostStyle;
                    svg.setAttribute('style', merged);
                    continue;
                }

                // Ensure width/height from the host override the SVG's defaults
                if (name === 'width' || name === 'height') {
                    svg.setAttribute(name, value);
                    continue;
                }

                svg.setAttribute(name, value);
            }

            this.replaceWith(svg);
        } catch (err) {
            console.error(err);
        }
    }
}

if (!customElements.get('svg-i')) {
    customElements.define('svg-i', SVGI);
}