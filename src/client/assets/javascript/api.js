const Api = (function() {
  const SERVER = 'http://localhost:8000'

  const getTracks = function() {
    return fetch(`${SERVER}/api/tracks`)
      .then(res => res.json())
      .catch(err => console.log("Problem with getTracks request::", err))
  }

  return {
    getTracks: getTracks,
  }
})();

export default Api;