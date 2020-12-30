const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_PATH || 'sensorReadings.db');
db.exec(`
  create table if not exists sensorReadings (
    serverTimestamp integer not null,
    hostTimestamp integer not null,
    host text not null,
    sensor text not null,
    measurement real not null,
    unit text not null
  )
`);
const insert = db.prepare(`
  insert into sensorReadings (serverTimestamp, hostTimestamp, host, sensor, measurement, unit)
  values (@serverTimestamp, @hostTimestamp, @host, @sensor, @measurement, @unit)
`);
const insertMany = db.transaction(readings => readings.forEach(r => insert.run(r)));

router.get('/readings', (req, res) => {
  res.send(db.prepare(`select serverTimestamp, hostTimestamp, host, sensor, measurement, unit from sensorReadings`).all());
});

router.post('/readings', (req, res) => {
  const serverTimestamp = Date.now();
  const readings = req.body;
  if (!readings.every(readingHasValidFields)) {
    res.sendStatus(400);
    return;
  }

  insertMany(readings.map(({ timestamp: hostTimestamp, host, sensor, measurement, unit }) => ({
    serverTimestamp,
    hostTimestamp,
    host,
    sensor,
    measurement,
    unit
  })));
  res.sendStatus(201);
});

function readingHasValidFields(reading) {
  return ['timestamp', 'measurement'].every(field => typeof (reading[field]) === 'number') &&
    ['host', 'sensor', 'unit'].every(field => typeof (reading[field]) === 'string');
}

module.exports = router;