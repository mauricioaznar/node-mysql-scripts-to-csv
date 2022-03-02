const mysql = require('mysql2/promise');
const fs = require('fs/promises')
const ObjectsToCsv = require('objects-to-csv')


const USERNAME = "root";
const PASSWORD = "root";
const DATABASE = "inopack";
const SQL_SCRIPT_DIR = "sql-scripts";
const CSV_DIR = "csvs";

(async function () {
  const connection = await mysql.createConnection({
    user: USERNAME,
    password: PASSWORD,
    database: DATABASE,
  });

  const files = (await fs.readdir(`./${SQL_SCRIPT_DIR}`))
    .filter((f) => {
      return f.split(".")[1] === "sql";
    })


  for (const file of files) {
    const fileHandle = await fs.open(`./${SQL_SCRIPT_DIR}/${file}`, 'r')
    const query = await fileHandle.readFile('utf-8')
    const [result, ] = await connection.execute(query)
    const csv = new ObjectsToCsv(result)
    const filename_without_extension = file.split('.')[0]
    await csv.toDisk(`./${CSV_DIR}/${filename_without_extension}.csv`, { append: false})
    await fileHandle.close()
  }


  await connection.end();
})();