exports.handler = async function(event, context) {
  const token = '4f8b20601b16434e8d8a1dc8593f7b62'
  const url = 'https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED'
  try {
    const response = await fetch(url, { headers: { 'X-Auth-Token': token } })
    const data = await response.json()
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
