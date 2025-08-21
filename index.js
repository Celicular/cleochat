import {generateLongString} from './functions.js'
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import mysql2 from 'mysql2';
const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());

const db = mysql2.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'celi',
        database: 'cleochat'
    }
);


app.get("/", (req, res) => {
    res.send("online");
})


app.post("/register", async (req, res) => {
    const { name, mobile, email, password } = req.body;
    console.log("Received registration data:", { name, mobile, email, password });
    const hashedpwd = await bcrypt.hash(password,8);

    db.query("SELECT * FROM USERS WHERE LOWER(email) = LOWER(?) OR mobile = ?", [email, mobile], (err, result) => {
        if(err) throw err;
        if(result.length != 0){
            res.json({
                result:'fail',
                data: 'userexists'
            })
        }
    })

    const session = generateLongString();


    db.query('INSERT INTO users (name, pwd, email, mobile, session) VALUES (?,?,?,?,?)',[name, hashedpwd, email, mobile, session ],(err, result)=> {
       if(err) throw err;
       res.json({result:'ok',data:'added user'}); 
    })
});


app.post("/verify", async(req, res) => {
    const {cookie} = req.body;
    db.query("SELECT * FROM users WHERE session=?", [cookie], async (err, result) => {
        if(err) throw err
        if(result.length != 0){
            console.log(result);
            res.json({
                result:'ok'
            })
        }else{
            res.json({
                result:"fail"
            })
        }
    })
})


app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    console.log({email, password});
    db.query('SELECT * FROM USERS WHERE email = ?', [email], async (err, result) => {
        if(err) throw err;
        if(result.length == 0){
            res.json({result:'fail', data:"nodata"});
            return;
        }
        const user = result[0];
        const match  = await bcrypt.compare(password, user.pwd)
        console.log(match);
        if(match){
            let newsession = generateLongString();
            db.query("UPDATE users SET session = ? WHERE session = ?", [newsession, user.session], (err, result) => {
                if(err) throw err;
            })
            res.json({
                result:'ok',
                data:"loggedin",
                session:newsession
            })
        }else{
            res.json({
                result:'fail',
                data:"false"
            })
        }
        })
    })





app.listen(PORT, () => {
    console.log("server running")
})