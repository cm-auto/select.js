export async function select(selector: string, ancestor: Document | Element = document, timeoutInMil = 10000): Promise<HTMLElement | null> {
	const early = ancestor.querySelector(selector)
	if (early) {
		return early as HTMLElement
	}

	return await selectOnlyObserver(selector, ancestor, timeoutInMil)
}

export async function selectOnlyObserver(selector: string, ancestor: Node = document, timeoutInMil = 10000): Promise<HTMLElement | null> {

	const promise = new Promise<HTMLElement>((resolve, reject) => {

		// declared up here because it needs to be
		// reachable by observer and timeout,
		// however since it also cleans them up
		// it is set at the bottom of this promise
		let cleanupFunction: () => void

		const observer = new MutationObserver(mutationRecords => {
			for (const mutation of mutationRecords) {
				function isSearchedElement(node: Node) {
					if (!(node instanceof HTMLElement)) {
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

/**
 * @param element
 * @param timeoutInMil
 * @returns true if element is not part of dom anymore, otherwise false
 */
export async function waitForRemovalFromDom(element: HTMLElement, timeoutInMil = 10000): Promise<boolean> {

	if (!element.isConnected) {
		return true
	}

	const promise = new Promise<boolean>((resolve, reject) => {

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