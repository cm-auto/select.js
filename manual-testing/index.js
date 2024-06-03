"use strict"

import { select, waitForRemovalFromDom } from "../dist/lib.js"

async function sleep(timeoutMilliseconds) {
    await new Promise(resolve => setTimeout(resolve, timeoutMilliseconds))
}

!async function () {
    select("#test", document.body).then(item => console.log("found it", item))
    await sleep(1_000)
    const element = document.createElement("div")
    element.id = "test"
    element.innerText = "hello"
    document.body.appendChild(element)
    await sleep(1_000)
    waitForRemovalFromDom(element).then(wasRemoved => console.log(`I've ${wasRemoved ? "" : "not "}been removed`))
    await sleep(2_000)
    element.remove()
    console.log("end of main")
}()