import Api from "../../src/client/assets/javascript/api";

describe("Index", function() {
  it("should be able handle a successful API call", async function() {
    const result = await Api.getTracks();
    expect(result).not.toBe(undefined);
  })
});