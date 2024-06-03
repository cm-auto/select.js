import { add } from "../lib"

test("add does work", () => {
    const expected = 5
    const actual = add(2, 3)
    expect(actual).toBe(expected)
})