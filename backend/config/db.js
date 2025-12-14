import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "clothes_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Kết nối MySQL thành công!");
});

export default db;
