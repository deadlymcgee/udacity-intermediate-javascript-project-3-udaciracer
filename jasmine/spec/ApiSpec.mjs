import { getTracks} from "../../src/client/assets/javascript/api";

describe("Index", function() {
  it("should be able handle a successful API call", async function() {
    const result = await getTracks();
    expect(result).not.toBe(undefined);
  })
});