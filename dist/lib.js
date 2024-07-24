/**
 * Asynchronously selects an element from the DOM.
 *
 * @param {string} selector - The CSS selector to match against.
 * @param {Document | Element} [ancestor=document] - The root element to search within.
 * @param {Strategy | number} [strategy={ variant: "interval", timeoutInMil: 10_000, intervalInMil: 50 }] - The strategy to use for searching or just a timeout in milliseconds.
 * @returns {Promise<Element | null>} A Promise that resolves to the selected element or null.
 */
export async function select(selector, ancestor = document, strategy = {
    variant: "interval",
    timeoutInMil: 10000,
    intervalInMil: 50,
}) {
    const early = ancestor.querySelector(selector);
    if (early) {
        return early;
    }
    const strategyParsed = typeof strategy === "number" ? { variant: "interval", timeoutInMil: strategy, } : strategy;
    switch (strategyParsed.variant) {
        case "interval":
            return await selectWithInterval(selector, ancestor, strategyParsed);
        case "observer":
            return await selectOnlyObserver(selector, ancestor, strategyParsed);
    }
}
async function selectOnlyObserver(selector, ancestor = document, options = {
    timeoutInMil: 10000,
}) {
    var _a;
    const timeoutInMil = (_a = options === null || options === void 0 ? void 0 : options.timeoutInMil) !== null && _a !== void 0 ? _a : 10000;
    const promise = new Promise((resolve, reject) => {
        // declared up here because it needs to be
        // reachable by observer and timeout,
        // however since it also cleans them up
        // it is set at the bottom of this promise
        let cleanupFunction;
        const observer = new MutationObserver(mutationRecords => {
            for (const mutation of mutationRecords) {
                function isSearchedElement(node) {
                    if (!(node instanceof Element)) {
                        return false;
                    }
                    if (node.matches(selector)) {
                        cleanupFunction();
                        resolve(node);
                        return true;
                    }
                    return false;
                }
                if (isSearchedElement(mutation.target)) {
                    return;
                }
                for (const child of mutation.addedNodes) {
                    if (isSearchedElement(child)) {
                        return true;
                    }
                }
            }
        });
        observer.observe(ancestor, {
            childList: true,
            subtree: true,
            characterDataOldValue: false,
        });
        const timeoutId = setTimeout(() => {
            cleanupFunction();
            reject();
        }, timeoutInMil);
        // clean up timeout and unregister from mutation observer
        cleanupFunction = () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    });
    try {
        return await promise;
    }
    catch (_b) {
        return null;
    }
}
async function selectWithInterval(selector, ancestor = document, options = {
    timeoutInMil: 10000,
    intervalInMil: 50,
}) {
    var _a, _b;
    const timeoutInMil = (_a = options === null || options === void 0 ? void 0 : options.timeoutInMil) !== null && _a !== void 0 ? _a : 10000;
    const intervalInMil = (_b = options === null || options === void 0 ? void 0 : options.intervalInMil) !== null && _b !== void 0 ? _b : 50;
    const promise = new Promise((resolve, reject) => {
        // declared up here because it needs to be
        // reachable by interval and timeout,
        // however since it also cleans them up
        // it is set at the bottom of this promise
        let cleanupFunction;
        const intervalId = setInterval(() => {
            const element = ancestor.querySelector(selector);
            if (element) {
                cleanupFunction();
                resolve(element);
            }
        }, intervalInMil);
        const timeoutId = setTimeout(() => {
            cleanupFunction();
            reject();
        }, timeoutInMil);
        // clean up interval and timeout
        cleanupFunction = () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    });
    try {
        return await promise;
    }
    catch (_c) {
        return null;
    }
}
/**
 * Waits for an element to be removed from the DOM.
 *
 * @param {Element} element - The element to wait for removal.
 * @param {Strategy | number} [strategy={variant: "interval", timeoutInMil: 10_000, intervalInMil: 50}] - The strategy to use for waiting. Can be a custom strategy object or a number representing the timeout in milliseconds.
 * @returns {Promise<boolean>} - A promise that resolves to true if the element has been removed from the DOM, or false if the timeout is reached.
 */
export async function waitForRemovalFromDom(element, strategy = {
    variant: "interval",
    timeoutInMil: 10000,
    intervalInMil: 50,
}) {
    if (!element.isConnected) {
        return true;
    }
    const strategyParsed = typeof strategy === "number" ? { variant: "interval", timeoutInMil: strategy, } : strategy;
    switch (strategyParsed.variant) {
        case "interval":
            return await waitForRemovalFromDomWithInterval(element, strategyParsed.timeoutInMil, strategyParsed.intervalInMil);
        case "observer":
            return await waitForRemovalFromDomWithMutationObserver(element, strategyParsed.timeoutInMil);
    }
}
async function waitForRemovalFromDomWithMutationObserver(element, timeoutInMil = 10000) {
    const promise = new Promise((resolve, reject) => {
        // declared up here because it needs to be
        // reachable by observer and timeout,
        // however since it also cleans them up
        // it is set at the bottom of this promise
        let cleanupFunction;
        const observer = new MutationObserver(_mutationRecords => {
            if (!element.isConnected) {
                cleanupFunction();
                return resolve(true);
            }
        });
        observer.observe(document, {
            childList: true,
            subtree: true,
            characterDataOldValue: false,
        });
        const timeoutId = setTimeout(() => {
            cleanupFunction();
            return reject();
        }, timeoutInMil);
        // clean up timeout and unregister from mutation observer
        cleanupFunction = () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    });
    try {
        return await promise;
    }
    catch (_a) {
        return false;
    }
}
async function waitForRemovalFromDomWithInterval(element, timeoutInMil = 10000, intervalInMil = 50) {
    const promise = new Promise((resolve, reject) => {
        // declared up here because it needs to be
        // reachable by interval and timeout,
        // however since it also cleans them up
        // it is set at the bottom of this promise
        let cleanupFunction;
        const intervalId = setInterval(() => {
            if (!element.isConnected) {
                cleanupFunction();
                return resolve(true);
            }
        }, intervalInMil);
        const timeoutId = setTimeout(() => {
            cleanupFunction();
            return reject();
        }, timeoutInMil);
        // clean up interval and timeout
        cleanupFunction = () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    });
    try {
        return await promise;
    }
    catch (_a) {
        return false;
    }
}
//# sourceMappingURL=lib.js.map