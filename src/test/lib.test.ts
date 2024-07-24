import { select, waitForRemovalFromDom } from "../lib"

class MockDocument {
    private element: null | Element = null

    constructor(element: null | Element = null) {
        this.element = element
    }

    querySelector(_selector: string): Element | null {
        return this.element as unknown as Element
    }

    asDocument(): Document {
        return this as unknown as Document
    }

    setElement(element: Element | null) {
        this.element = element
    }
}

test("select early return", async () => {
    const dummyElement = {} as Element
    const mockDocument = new MockDocument(dummyElement)

    const actual = await select("#test", mockDocument.asDocument())
    expect(actual).toBe(dummyElement)
})

test("select 1 second return", async () => {
    const dummyElement = {} as Element
    const mockDocument = new MockDocument()

    const selectPromise = select("#test", mockDocument.asDocument())

    setTimeout(() => {
        mockDocument.setElement(dummyElement)
    }, 1_000)

    const actual = await selectPromise
    expect(actual).toBe(dummyElement)
})

test("select timeout returns null", async () => {
    const mockDocument = new MockDocument()

    const actual = await select("#test", mockDocument.asDocument(), 1_000)
    expect(actual).toBe(null)
})

class MockElement {
    isConnected = false
    constructor(isConnected: boolean = false) {
        this.isConnected = isConnected
    }

    asElement(): Element {
        return this as unknown as Element
    }
}

test("waitForRemovalFromDom early return", async () => {
    // we're never adding the element to the dom
    const dummyElement = new MockElement()

    const removedFromDom = await waitForRemovalFromDom(dummyElement.asElement())
    expect(removedFromDom).toBe(true)
})

test("waitForRemovalFromDom 1 second return", async () => {
    const dummyElement = new MockElement(true)

    const waitPromise = waitForRemovalFromDom(dummyElement.asElement())

    setTimeout(() => {
        dummyElement.isConnected = false
    }, 1_000)

    const removedFromDom = await waitPromise
    expect(removedFromDom).toBe(true)
})

test("waitForRemovalFromDom timeout returns false", async () => {
    const dummyElement = new MockElement(true)

    const removedFromDrom = await waitForRemovalFromDom(dummyElement.asElement(), 1_000)
    expect(removedFromDrom).toBe(false)
})