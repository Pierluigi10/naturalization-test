// DOM Diffing and Patching utilities
// Optimizes rendering by updating only changed elements

const DOMDiffer = {
    /**
     * Update element attributes if they changed
     * @param {HTMLElement} element - DOM element
     * @param {Object} newAttrs - New attributes
     */
    updateAttributes(element, newAttrs) {
        // Remove old attributes that don't exist in new
        for (const attr of element.attributes) {
            if (!(attr.name in newAttrs)) {
                element.removeAttribute(attr.name);
            }
        }

        // Set new attributes
        for (const [name, value] of Object.entries(newAttrs)) {
            if (element.getAttribute(name) !== value) {
                element.setAttribute(name, value);
            }
        }
    },

    /**
     * Update text content if changed
     * @param {HTMLElement} element - DOM element
     * @param {string} newText - New text content
     */
    updateTextContent(element, newText) {
        if (element.textContent !== newText) {
            element.textContent = newText;
        }
    },

    /**
     * Update innerHTML only if changed (more efficient than full replace)
     * @param {HTMLElement} element - DOM element
     * @param {string} newHTML - New HTML content
     * @returns {boolean} true if updated
     */
    updateHTML(element, newHTML) {
        if (element.innerHTML !== newHTML) {
            element.innerHTML = newHTML;
            return true;
        }
        return false;
    },

    /**
     * Patch element with new HTML using smart diffing
     * @param {HTMLElement} oldElement - Existing element
     * @param {string} newHTML - New HTML string
     * @returns {boolean} true if updated
     */
    patchElement(oldElement, newHTML) {
        // Quick check: if HTML is identical, skip
        if (oldElement.innerHTML === newHTML) {
            return false;
        }

        // Create temporary container to parse new HTML
        const temp = document.createElement('div');
        temp.innerHTML = newHTML;
        const newElement = temp.firstElementChild;

        if (!newElement) {
            // Empty content
            oldElement.innerHTML = '';
            return true;
        }

        // If tags are different, replace entirely
        if (oldElement.tagName !== newElement.tagName) {
            oldElement.replaceWith(newElement);
            return true;
        }

        // Update attributes
        this.updateAttributes(oldElement,
            Object.fromEntries([...newElement.attributes].map(a => [a.name, a.value]))
        );

        // Diff children
        this.diffChildren(oldElement, newElement);

        return true;
    },

    /**
     * Diff and patch child nodes
     * @param {HTMLElement} oldParent - Old parent element
     * @param {HTMLElement} newParent - New parent element with desired state
     */
    diffChildren(oldParent, newParent) {
        const oldChildren = Array.from(oldParent.childNodes);
        const newChildren = Array.from(newParent.childNodes);

        const maxLength = Math.max(oldChildren.length, newChildren.length);

        for (let i = 0; i < maxLength; i++) {
            const oldChild = oldChildren[i];
            const newChild = newChildren[i];

            if (!oldChild && newChild) {
                // New child added
                oldParent.appendChild(newChild.cloneNode(true));
            } else if (oldChild && !newChild) {
                // Old child removed
                oldChild.remove();
            } else if (oldChild && newChild) {
                // Both exist, check if they need updating
                if (oldChild.nodeType === Node.TEXT_NODE &&
                    newChild.nodeType === Node.TEXT_NODE) {
                    // Text nodes
                    if (oldChild.textContent !== newChild.textContent) {
                        oldChild.textContent = newChild.textContent;
                    }
                } else if (oldChild.nodeType === Node.ELEMENT_NODE &&
                           newChild.nodeType === Node.ELEMENT_NODE) {
                    // Element nodes
                    if (oldChild.tagName === newChild.tagName) {
                        // Same tag, update attributes and recurse
                        this.updateAttributes(oldChild,
                            Object.fromEntries([...newChild.attributes].map(a => [a.name, a.value]))
                        );
                        this.diffChildren(oldChild, newChild);
                    } else {
                        // Different tags, replace
                        oldChild.replaceWith(newChild.cloneNode(true));
                    }
                } else {
                    // Different node types, replace
                    oldChild.replaceWith(newChild.cloneNode(true));
                }
            }
        }
    },

    /**
     * Update specific part of DOM by selector
     * @param {string} selector - CSS selector
     * @param {string} newHTML - New HTML content
     * @param {boolean} useInnerHTML - If true, update innerHTML directly (faster but less precise)
     * @returns {boolean} true if updated
     */
    updateBySelector(selector, newHTML, useInnerHTML = false) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`[DOMDiffer] Element not found: ${selector}`);
            return false;
        }

        if (useInnerHTML) {
            return this.updateHTML(element, newHTML);
        } else {
            return this.patchElement(element, newHTML);
        }
    },

    /**
     * Batch update multiple elements
     * @param {Array<{selector: string, html: string, useInnerHTML?: boolean}>} updates
     * @returns {number} Number of elements updated
     */
    batchUpdate(updates) {
        let count = 0;

        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            for (const update of updates) {
                if (this.updateBySelector(update.selector, update.html, update.useInnerHTML)) {
                    count++;
                }
            }
        });

        return count;
    },

    /**
     * Create a cached renderer function
     * Returns a function that only updates when data changes
     * @param {Function} renderFn - Function that returns HTML string
     * @returns {Function} Optimized render function
     */
    createCachedRenderer(renderFn) {
        let lastData = null;
        let lastHTML = null;

        return function(data, forceUpdate = false) {
            // Deep equality check (simple JSON comparison)
            const dataStr = JSON.stringify(data);

            if (!forceUpdate && dataStr === JSON.stringify(lastData)) {
                // Data hasn't changed, skip render
                return lastHTML;
            }

            lastData = data;
            lastHTML = renderFn(data);
            return lastHTML;
        };
    },

    /**
     * Efficiently update a list of items (with keys for identity)
     * @param {HTMLElement} container - Container element
     * @param {Array} items - Array of items to render
     * @param {Function} renderItem - Function(item, index) => HTML string
     * @param {Function} getKey - Function(item) => unique key
     */
    updateList(container, items, renderItem, getKey) {
        const existingChildren = Array.from(container.children);
        const existingKeys = new Map();

        // Map existing children by key
        existingChildren.forEach(child => {
            const key = child.getAttribute('data-key');
            if (key) {
                existingKeys.set(key, child);
            }
        });

        // Build new children
        const newChildren = [];
        const usedKeys = new Set();

        items.forEach((item, index) => {
            const key = getKey(item);
            const html = renderItem(item, index);

            let child = existingKeys.get(key);

            if (child) {
                // Reuse existing element
                this.updateHTML(child, html);
                usedKeys.add(key);
            } else {
                // Create new element
                const temp = document.createElement('div');
                temp.innerHTML = html;
                child = temp.firstElementChild;
                if (child) {
                    child.setAttribute('data-key', key);
                }
            }

            if (child) {
                newChildren.push(child);
            }
        });

        // Remove unused children
        existingChildren.forEach(child => {
            const key = child.getAttribute('data-key');
            if (key && !usedKeys.has(key)) {
                child.remove();
            }
        });

        // Append/reorder new children
        newChildren.forEach((child, index) => {
            if (container.children[index] !== child) {
                if (index < container.children.length) {
                    container.insertBefore(child, container.children[index]);
                } else {
                    container.appendChild(child);
                }
            }
        });
    }
};
