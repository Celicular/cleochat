import {generateLongString} from './functions.js';
import {fileURLToPath} from 'url';
import path from 'path';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import mysql2 from 'mysql2';
import http from "http";
import {Server} from 'socket.io'
const app = express();
const PORT = 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));




const db = mysql2.createConnection(
    {
        host: 'battlegroundmobileindia.in',
        user: 'u423328347_celi',
        password: 'Celi@4321',
        database: 'u423328347_test'
    }
);


const server = http.createServer(app);

const io = new Server(server, {
    cors :{
        origin:  "*"
    },
})

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public' , 'main.html')));


app.post("/register", async (req, res) => {
    const { name, mobile, email, password, username } = req.body;
    console.log("Received registration data:", { name, mobile, email, password, username });
    const hashedpwd = await bcrypt.hash(password,8);

    db.query("SELECT * FROM cusers WHERE LOWER(username) = LOWER(?) OR mobile = ?", [username, mobile], (err, result) => {
        if(err) throw err;
        if(result.length != 0){
            res.json({
                result:'fail',
                data: 'userexists'
            })
        }else{
            const session = generateLongString(64);
            const address = generateLongString(16);
            const invite = generateLongString(6);

            db.query('INSERT INTO cusers (name, pwd, email, mobile, session, username, address) VALUES (?,?,?,?,?,?,?)',[name, hashedpwd, email, mobile, session, username, address ],(err, result)=> {
            if(err) throw err;
            db.query('INSERT INTO cuserstatus (address) VALUES (?)', [address], (e,r) => {
                if(e) throw e;
            })
            db.query('INSERT INTO userpublic (InviteId, userAddress) VALUES (?, ?)', [invite, address], (e,r) => {
                if(e) throw e;
            })
            db.query('INSERT INTO userContacts (address, contactData) VALUES (?, ?)', [address, ""], (e,r) => {
                if(e) throw e;
            })
            res.json({result:'ok',data:'added user'}); 
            })
        }
    })

    
});


app.post("/invite", (req, res) => {
    const data = req.body;
    console.log(data);
    let address;
    db.query("SELECT * FROM cusers WHERE session=?", [data.session], async (err, result) => {
        if(err) throw err
        const userData = result[0];
        address = userData.address;
        db.query("SELECT * FROM userpublic WHERE userAddress = ?", [address], (e,r) => {
            if (e) throw e;
            const callbackdata = r[0];
            if(callbackdata.InviteId !== data.invite){
                db.query("SELECT contactData FROM userContacts WHERE address = ?", [address], (e,r) => {
                    const currentInvites = r[0].contactData.split(",");
                    if(currentInvites.includes(data.invite)){
                        res.json({
                            result : 'fail due to invite exist'
                        })
                    }else{
                        db.query("UPDATE userContacts SET contactData = CONCAT(contactData, ?) WHERE address = ?", [data.invite + ",", address], (e,r) => {
                            if(e) throw e;
                        })
                        res.json({
                            result : 'ok'
                        })
                    }
                })                
            }else{
                res.json({
                    result : 'fail'
                })
            }
        })
    })




    
    
})

app.post("/verify", async(req, res) => {
    const {cookie} = req.body;
    db.query("SELECT * FROM cusers WHERE session=?", [cookie], async (err, result) => {
        if(err) throw err
        if(result.length != 0){
            console.log(result);
            const myaddress = result[0].address;
            let finaldata = myaddress;
            db.query("SELECT contactData FROM userContacts WHERE address = ?", [result[0].address], (e,r) => {
                if(e) throw e;
                const contacts = r[0].contactData.split(",").filter(item => item !== "");
                console.log(contacts);
                if(contacts.length < 1){
                    db.query("SELECT up.InviteId FROM cusers u JOIN userpublic up ON u.address = up.userAddress where u.session = ?", [cookie], (e,r) => {
                        if(e) throw e
                        
                        res.json({
                        myInviteId : r[0].InviteId,
                        address : finaldata,
                        result : 'ok'   
                    })
                    })
                    
                }else{
                db.query("SELECT userAddress FROM userpublic WHERE InviteId IN (?)", [contacts], (e,r) => {
                    if(e) throw e;
                    console.log(r);
                    let addresses = [];
                    r.forEach((rdata => {
                        addresses.push(rdata.userAddress.trim());
                    }))

                    db.query("SELECT name, username, address FROM cusers WHERE address IN (?)",[addresses], (e,r) => {
                        if(e) throw e;
                        console.log(r);
                        let finaluserdata = r;
                        db.query("SELECT up.InviteId FROM cusers u JOIN userpublic up ON u.address = up.userAddress where u.session = ?", [cookie], (e,r) => {
                            if(e) throw e;
                            let myInviteID = r[0].InviteId;
                            console.log(r[0].InviteId);

                            res.json({
                                result : 'ok',
                                userData : finaluserdata,
                                myInviteId : myInviteID,
                                address : myaddress
                            })
                        })
                    })



                    // res.json(
                    //         {
                    //             result : 'ok',
                    //             userData : r
                    //         }
                    //     )
                })
            }
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
    db.query('SELECT * FROM cusers WHERE email = ?', [email], async (err, result) => {
        if(err) throw err;
        if(result.length == 0){
            res.json({result:'fail', data:"nodata"});
            return;
        }
        const user = result[0];
        const match  = await bcrypt.compare(password, user.pwd)
        console.log(match);
        if(match){
            let newsession = generateLongString(64);
            db.query("UPDATE cusers SET session = ? WHERE session = ?", [newsession, user.session], (err, result) => {
                if(err) throw err;
            })
            console.log(newsession);
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



app.post("/getuserdata", (req, res) => {
    const {username} = req.body;
    //get last message too
    db.query("SELECT address, name FROM cusers WHERE username = ?", [username], (e,r) =>{
        if(e) throw e;
        res.send({
            data:r[0]
        })
    })
})
    
app.post("/getchats", (req, res) => {
    const {saddr, raddr} = req.body;
    db.query("SELECT * FROM chats WHERE (senderaddr = ? AND recieveaddr = ?) OR (senderaddr = ? AND recieveaddr = ?)",  [saddr, raddr, raddr, saddr], (e,r) => {
        if(e) throw e;
        let messagedata = r.map(data => ({
                mid: data.id,
                seaddr: data.senderaddr,
                readdr: data.recieveaddr,
                message: data.message,
                date: data.created_at,
                read: data.isread,
                sent: data.issent 
        }))
        res.json(messagedata);
    })
})


app.post("/sendMsg", (req, res) => {
    const {saddr, raddr, message} = req.body;
    db.query("INSERT INTO chats(senderaddr, recieveaddr, message, isread, issent, type) VALUES (?,?,?,?,?,?)", [saddr, raddr, message, 0, 1, "message"], (e,r) => {
        if(e) throw e;
        res.json({
            status: true
        })
    })
})

const roomusers = {}

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("register", (address) => {
    socket.join(address); // join a room
    console.log(`${address} joined their room`);

    if(!roomusers[address]){
        roomusers[address] = []
    }
    roomusers[address].push(address)
  });

  socket.on("sendMsg", ({ saddr, raddr, message }) => {
    if(roomusers[raddr] && roomusers[raddr].length > 0){
        roomusers[raddr].forEach(socketId => {
            io.to(socketId).emit("newMessage", {
                saddr,
                raddr,
                message,
                date: new Date()
            });
        });
    }

    if(roomusers[saddr] && roomusers[saddr].length > 0){
        roomusers[saddr].forEach(socketId => {
            io.to(socketId).emit("newMessage", {
                saddr,
                raddr,
                message,
                date: new Date()
            });
        });
    }
});

 

  socket.on("disconnect", () => {
    for (let room in roomusers) {
      roomusers[room] = roomusers[room].filter(id => id !== socket.id);

      if (roomusers[room].length === 0) {
        delete roomusers[room];
      }
    }
});

 });


server.listen(PORT, "0.0.0.0", () => {
    console.log("server running")
})