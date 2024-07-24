export type Strategy =
	{
		variant: "interval",
	} & IntervalOptions
	|
	{
		variant: "observer",
	} & ObserverOptions

/**
 * Asynchronously selects an element from the DOM.
 *
 * @param {string} selector - The CSS selector to match against.
 * @param {Document | Element} [ancestor=document] - The root element to search within.
 * @param {Strategy | number} [strategy={ variant: "interval", timeoutInMil: 10_000, intervalInMil: 50 }] - The strategy to use for searching or just a timeout in milliseconds.
 * @returns {Promise<Element | null>} A Promise that resolves to the selected element or null.
 */
export async function select(
	selector: string,
	ancestor: Document | Element = document,
	strategy: Strategy | number = {
		variant: "interval",
		timeoutInMil: 10_000,
		intervalInMil: 50,
	},
): Promise<Element | null> {
	const early = ancestor.querySelector(selector)
	if (early) {
		return early
	}

	const strategyParsed = typeof strategy === "number" ? { variant: "interval", timeoutInMil: strategy, } as Strategy : strategy
	switch (strategyParsed.variant) {
		case "interval":
			return await selectWithInterval(selector, ancestor, strategyParsed)
		case "observer":
			return await selectOnlyObserver(selector, ancestor, strategyParsed)
	}
}

export type ObserverOptions = {
	timeoutInMil?: number,
}
async function selectOnlyObserver(
	selector: string,
	ancestor: Document | Element = document,
	options: ObserverOptions = {
		timeoutInMil: 10_000,
	},
): Promise<Element | null> {
	const timeoutInMil = options?.timeoutInMil ?? 10_000

	const promise = new Promise<Element>((resolve, reject) => {

		// declared up here because it needs to be
		// reachable by observer and timeout,
		// however since it also cleans them up
		// it is set at the bottom of this promise
		let cleanupFunction: () => void

		const observer = new MutationObserver(mutationRecords => {
			for (const mutation of mutationRecords) {
				function isSearchedElement(node: Node) {
					if (!(node instanceof Element)) {
						return false
					}
					if (node.matches(selector)) {
						cleanupFunction()
						resolve(node)
						return true
					}
					return false
				}
				if (isSearchedElement(mutation.target)) {
					return
				}
				for (const child of mutation.addedNodes) {
					if (isSearchedElement(child)) {
						return true
					}
				}
			}
		})

		observer.observe(ancestor, {
			childList: true,
			subtree: true,
			characterDataOldValue: false,
		})

		const timeoutId = setTimeout(() => {
			cleanupFunction()
			reject()
		}, timeoutInMil)

		// clean up timeout and unregister from mutation observer
		cleanupFunction = () => {
			clearTimeout(timeoutId)
			observer.disconnect()
		}
	})
	try {
		return await promise
	}
	catch {
		return null
	}

}

export type IntervalOptions = {
	timeoutInMil?: number,
	intervalInMil?: number,
}
async function selectWithInterval(
	selector: string,
	ancestor: Document | Element = document,
	options: IntervalOptions = {
		timeoutInMil: 10000,
		intervalInMil: 50,
	},
): Promise<Element | null> {

	const timeoutInMil = options?.timeoutInMil ?? 10_000
	const intervalInMil = options?.intervalInMil ?? 50

	const promise = new Promise<Element>((resolve, reject) => {

		// declared up here because it needs to be
		// reachable by interval and timeout,
		// however since it also cleans them up
		// it is set at the bottom of this promise
		let cleanupFunction: () => void

		const intervalId = setInterval(() => {
			const element = ancestor.querySelector(selector)
			if (element) {
				cleanupFunction()
				resolve(element)
			}
		}, intervalInMil)

		const timeoutId = setTimeout(() => {
			cleanupFunction()
			reject()
		}, timeoutInMil)

		// clean up interval and timeout
		cleanupFunction = () => {
			clearInterval(intervalId)
			clearTimeout(timeoutId)
		}
	})
	try {
		return await promise
	}
	catch {
		return null
	}

}

/**
 * Waits for an element to be removed from the DOM.
 *
 * @param {Element} element - The element to wait for removal.
 * @param {Strategy | number} [strategy={variant: "interval", timeoutInMil: 10_000, intervalInMil: 50}] - The strategy to use for waiting. Can be a custom strategy object or a number representing the timeout in milliseconds.
 * @returns {Promise<boolean>} - A promise that resolves to true if the element has been removed from the DOM, or false if the timeout is reached.
 */
export async function waitForRemovalFromDom(
	element: Element,
	strategy: Strategy | number = {
		variant: "interval",
		timeoutInMil: 10_000,
		intervalInMil: 50,
	},
): Promise<boolean> {
	if (!element.isConnected) {
		return true
	}

	const strategyParsed = typeof strategy === "number" ? { variant: "interval", timeoutInMil: strategy, } as Strategy : strategy
	switch (strategyParsed.variant) {
		case "interval":
			return await waitForRemovalFromDomWithInterval(element, strategyParsed.timeoutInMil, strategyParsed.intervalInMil)
		case "observer":
			return await waitForRemovalFromDomWithMutationObserver(element, strategyParsed.timeoutInMil)
	}
}

async function waitForRemovalFromDomWithMutationObserver(element: Element, timeoutInMil = 10000): Promise<boolean> {

	const promise = new Promise<true>((resolve, reject) => {

		// declared up here because it needs to be
		// reachable by observer and timeout,
		// however since it also cleans them up
		// it is set at the bottom of this promise
		let cleanupFunction: () => void

		const observer = new MutationObserver(_mutationRecords => {

			if (!element.isConnected) {
				cleanupFunction()
				return resolve(true)
			}

		})

		observer.observe(document, {
			childList: true,
			subtree: true,
			characterDataOldValue: false,
		})

		const timeoutId = setTimeout(() => {
			cleanupFunction()
			return reject()
		}, timeoutInMil)

		// clean up timeout and unregister from mutation observer
		cleanupFunction = () => {
			clearTimeout(timeoutId)
			observer.disconnect()
		}
	})
	try {
		return await promise
	}
	catch {
		return false
	}
}

async function waitForRemovalFromDomWithInterval(element: Element, timeoutInMil = 10000, intervalInMil = 50): Promise<boolean> {

	const promise = new Promise<true>((resolve, reject) => {

		// declared up here because it needs to be
		// reachable by interval and timeout,
		// however since it also cleans them up
		// it is set at the bottom of this promise
		let cleanupFunction: () => void

		const intervalId = setInterval(() => {
			if (!element.isConnected) {
				cleanupFunction()
				return resolve(true)
			}
		}, intervalInMil)

		const timeoutId = setTimeout(() => {
			cleanupFunction()
			return reject()
		}, timeoutInMil)

		// clean up interval and timeout
		cleanupFunction = () => {
			clearInterval(intervalId)
			clearTimeout(timeoutId)
		}
	})
	try {
		return await promise
	}
	catch {
		return false
	}
}