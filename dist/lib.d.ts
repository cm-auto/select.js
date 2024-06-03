export declare function select(selector: string, ancestor?: Document | Element, timeoutInMil?: number): Promise<HTMLElement | null>;
export declare function selectOnlyObserver(selector: string, ancestor?: Node, timeoutInMil?: number): Promise<HTMLElement | null>;
/**
 * @param element
 * @param timeoutInMil
 * @returns true if element is not part of dom anymore, otherwise false
 */
export declare function waitForRemovalFromDom(element: HTMLElement, timeoutInMil?: number): Promise<boolean>;
