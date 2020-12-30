import Database from "better-sqlite3";

// Server timestamp, host timestamp, host, sensor, measurement, unit
console.log('hello there');

const db = new Database('hello.db');
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

// insert.run(1, 2, 'hosto', 'senso', 27.1, 'C');
// insert.run(1, 3, 'hosto', 'senso', 22.3, 'C');
insert.run({ serverTimestamp: 2, hostTimestamp: 3, host: 'hosto', sensor: 'senso', measurement: 22.3, unit: 'C' });

console.log(db.prepare(`select * from sensorReadings`).all());