const getTracks = function() {

  const SERVER = 'http://localhost:8000'

  return fetch(`${SERVER}/api/tracks`)
    .then(res => res.json())
    .catch(err => console.log("Problem with getTracks request::", err))
}

export { getTracks };