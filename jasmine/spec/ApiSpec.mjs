import Api from "../../src/client/assets/javascript/api";

const JasmineHelpers = (function() {
  const successful = function() {
    return new Promise(resolve => {
      resolve("Successful!");
    })
  }
  const failed = function() {
    return new Promise((resolve, reject) => reject("Failed!"))
      .catch(err => console.log(err))
  }
  return {
    success: successful,
    failed: failed
  }
})();

describe("Index", function() {
  it("should be able handle a successful API call", async function() {
    spyOn(Api, 'getTracks').and.callFake(async function() {
      return await JasmineHelpers.success();
    })
    const result = await Api.getTracks();
    expect(result).not.toBe(undefined);
  })
  it("should be able handle an unsuccessful API call", async function() {
    spyOn(Api, 'getTracks').and.callFake(async function() {
      return await JasmineHelpers.failed();
    })
    const result = await Api.getTracks();
    expect(result).toBe(undefined);
  })
});