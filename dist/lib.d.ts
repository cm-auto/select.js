export type Strategy = {
    variant: "interval";
} & IntervalOptions | {
    variant: "observer";
} & ObserverOptions;
/**
 * Asynchronously selects an element from the DOM.
 *
 * @param {string} selector - The CSS selector to match against.
 * @param {Document | Element} [ancestor=document] - The root element to search within.
 * @param {Strategy | number} [strategy={ variant: "interval", timeoutInMil: 10_000, intervalInMil: 50 }] - The strategy to use for searching or just a timeout in milliseconds.
 * @returns {Promise<Element | null>} A Promise that resolves to the selected element or null.
 */
export declare function select(selector: string, ancestor?: Document | Element, strategy?: Strategy | number): Promise<Element | null>;
export type ObserverOptions = {
    timeoutInMil?: number;
};
export type IntervalOptions = {
    timeoutInMil?: number;
    intervalInMil?: number;
};
/**
 * Waits for an element to be removed from the DOM.
 *
 * @param {Element} element - The element to wait for removal.
 * @param {Strategy | number} [strategy={variant: "interval", timeoutInMil: 10_000, intervalInMil: 50}] - The strategy to use for waiting. Can be a custom strategy object or a number representing the timeout in milliseconds.
 * @returns {Promise<boolean>} - A promise that resolves to true if the element has been removed from the DOM, or false if the timeout is reached.
 */
export declare function waitForRemovalFromDom(element: Element, strategy?: Strategy | number): Promise<boolean>;
