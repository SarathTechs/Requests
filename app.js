const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const intializeDbAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

intializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const playerDetails = `SELECT * FROM cricket_team;`
  const players = await db.all(playerDetails)
  response.send(
    players.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  let bodyDetails = request.body

  let {playerName, jerseyNumber, role} = bodyDetails

  const postQuery = `INSERT INTO cricket_team (player_name, jersey_number, role)
  VALUES ( '${playerName}', ${jerseyNumber}, '${role}');`

  const player = await db.run(postQuery)

  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerIdQuery = `SELECT * FROM cricket_team WHERE player_id =  ${playerId};`
  const player = await db.get(playerIdQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  let bodyDetails = request.body

  let {playerName, jerseyNumber, role} = bodyDetails

  const updateQuery = `UPDATE cricket_team SET  player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}'
  WHERE player_id = ${playerId};`

  await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const deleteQuery = `DELETE FROM  cricket_team
  WHERE player_id = ${playerId};`

  await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
