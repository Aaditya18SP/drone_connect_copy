const {MongoClient}= require("mongodb")
const connString = process.env.MONGO_CONN_STRING;
const client = new MongoClient(connString)

let db;
async function mongo_db_connect(){
    let conn;
    try{
        conn = await client.connect()
        db = conn.db("droneconnect")
    }
    catch(e){
        console.error(e)
    }

    return db;

}

function get_db(){
    return db
}
module.exports = {mongo_db_connect,get_db}
