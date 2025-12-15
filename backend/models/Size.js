import db from "../config/db.js";

export class SizeModel {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM Size", (err, results) => {
        if (err) reject(err);
        else resolve(results); // trả trực tiếp mảng
      });
    });
  }
}
