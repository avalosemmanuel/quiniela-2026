const TOKEN = '4f8b20601b16434e8d8a1dc8593f7b62'
const API_URL = 'https://api.football-data.org/v4/competitions/WC/matches'

const TEAM_MAP = {
  'Mexico': '🇲🇽 México', 'South Africa': '🇿🇦 Sudáfrica',
  'Korea Republic': '🇰🇷 Corea del Sur', 'South Korea': '🇰🇷 Corea del Sur',
  'Czech Republic': '🇨🇿 Chequia', 'Czechia': '🇨🇿 Chequia',
  'Canada': '🇨🇦 Canadá', 'Bosnia and Herzegovina': '🇧🇦 Bosnia-Herz.', 'Bosnia-Herzegovina': '🇧🇦 Bosnia-Herz.',
  'Qatar': '🇶🇦 Qatar', 'Switzerland': '🇨🇭 Suiza', 'Brazil': '🇧🇷 Brasil',
  'Morocco': '🇲🇦 Marruecos', 'Haiti': '🇭🇹 Haití', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia',
  'United States': '🇺🇸 EE.UU.', 'USA': '🇺🇸 EE.UU.',
  'Paraguay': '🇵🇾 Paraguay', 'Australia': '🇦🇺 Australia',
  'Turkey': '🇹🇷 Türkiye', 'Türkiye': '🇹🇷 Türkiye',
  'Germany': '🇩🇪 Alemania', 'Curacao': '🇨🇼 Curazao', 'Curaçao': '🇨🇼 Curazao',
  "Côte d'Ivoire": '🇨🇮 Costa de Marfil', 'Ivory Coast': '🇨🇮 Costa de Marfil',
  'Ecuador': '🇪🇨 Ecuador', 'Netherlands': '🇳🇱 Países Bajos', 'Japan': '🇯🇵 Japón',
  'Sweden': '🇸🇪 Suecia', 'Tunisia': '🇹🇳 Túnez', 'Belgium': '🇧🇪 Bélgica',
  'Egypt': '🇪🇬 Egipto', 'Iran': '🇮🇷 Irán', 'New Zealand': '🇳🇿 Nueva Zelanda',
  'Spain': '🇪🇸 España', 'Cape Verde Islands': '🇨🇻 Cabo Verde', 'Cape Verde': '🇨🇻 Cabo Verde',
  'Saudi Arabia': '🇸🇦 Arabia Saudí', 'Uruguay': '🇺🇾 Uruguay', 'France': '🇫🇷 Francia',
  'Senegal': '🇸🇳 Senegal', 'Iraq': '🇮🇶 Irak', 'Norway': '🇳🇴 Noruega',
  'Argentina': '🇦🇷 Argentina', 'Algeria': '🇩🇿 Argelia', 'Austria': '🇦🇹 Austria',
  'Jordan': '🇯🇴 Jordania', 'Portugal': '🇵🇹 Portugal', 'Congo DR': '🇨🇩 RD Congo', 'DR Congo': '🇨🇩 RD Congo',
  'Uzbekistan': '🇺🇿 Uzbekistán', 'Colombia': '🇨🇴 Colombia', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra',
  'Croatia': '🇭🇷 Croacia', 'Ghana': '🇬🇭 Ghana', 'Panama': '🇵🇦 Panamá',
}

function mapTeam(name) { return TEAM_MAP[name] || name }

function utcToBarcelonaDateLabel(utcDateStr) {
  const d = new Date(utcDateStr)
  const bcn = new Date(d.getTime() + 2 * 60 * 60 * 1000)
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${bcn.getUTCDate()} ${months[bcn.getUTCMonth()]}`
}

const STAGE_MAP = {
  'LAST_32': 'R32', 'LAST_16': 'R16',
  'QUARTER_FINALS': 'QF', 'SEMI_FINALS': 'SF', 'FINAL': 'F',
}

async function fetchFromAPI() {
  // Try direct CORS request first (football-data.org supports CORS with token)
  try {
    const res = await fetch(API_URL, {
      headers: { 'X-Auth-Token': TOKEN }
    })
    if (res.ok) return await res.json()
  } catch (e) {
    console.log('Direct fetch failed, trying proxy...')
  }
  // Fallback: use a CORS proxy
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(API_URL + '?token=' + TOKEN)
    const res = await fetch(proxyUrl)
    if (res.ok) {
      const wrapper = await res.json()
      return JSON.parse(wrapper.contents)
    }
  } catch (e) {
    console.error('Proxy also failed:', e)
  }
  return null
}

export async function fetchAllMatches() {
  try {
    const json = await fetchFromAPI()
    if (!json) return { results: {}, dates: {}, knockout: {} }

    const results = {}
    const dates = {}
    const knockout = {}
    let r32count = 0, r16count = 0, qfcount = 0, sfcount = 0

    for (const match of (json.matches || [])) {
      const homeTeam = mapTeam(match.homeTeam?.name || '')
      const awayTeam = mapTeam(match.awayTeam?.name || '')
      const stage = match.stage

      if (stage === 'GROUP_STAGE') {
        if (!homeTeam || !awayTeam) continue
        const key = homeTeam + '|' + awayTeam
        const altKey = awayTeam + '|' + homeTeam
        if (match.utcDate) {
          dates[key] = utcToBarcelonaDateLabel(match.utcDate)
          dates[altKey] = utcToBarcelonaDateLabel(match.utcDate)
        }
        const homeGoals = match.score?.fullTime?.home
        const awayGoals = match.score?.fullTime?.away
        if (homeGoals !== null && homeGoals !== undefined && awayGoals !== null && awayGoals !== undefined) {
          results[key] = { home: homeGoals, away: awayGoals }
          results[altKey] = { home: awayGoals, away: homeGoals }
        }
      } else if (STAGE_MAP[stage]) {
        const round = STAGE_MAP[stage]
        if (!knockout[round]) knockout[round] = []
        let matchNum
        if (round === 'R32') matchNum = ++r32count
        else if (round === 'R16') matchNum = ++r16count
        else if (round === 'QF') matchNum = ++qfcount
        else if (round === 'SF') matchNum = ++sfcount
        else matchNum = 1

        const score = match.score
        let homeGoals = null
        let awayGoals = null
        if (score) {
          if (score.regularTime && score.regularTime.home !== null && score.regularTime.home !== undefined) {
            homeGoals = score.regularTime.home
            awayGoals = score.regularTime.away
          } else if (score.fullTime && score.fullTime.home !== null && score.fullTime.home !== undefined) {
            homeGoals = score.fullTime.home
            awayGoals = score.fullTime.away
          }
        }
        knockout[round].push({
          matchNum,
          homeTeam: homeTeam || null,
          awayTeam: awayTeam || null,
          date: match.utcDate ? utcToBarcelonaDateLabel(match.utcDate) : null,
          result: (homeGoals !== null && awayGoals !== null) ? { home: homeGoals, away: awayGoals } : null,
        })
      }
    }
    return { results, dates, knockout }
  } catch (e) {
    console.error('fetchAllMatches error:', e)
    return { results: {}, dates: {}, knockout: {} }
  }
}

export async function fetchResults() {
  const { results } = await fetchAllMatches()
  return results
}
