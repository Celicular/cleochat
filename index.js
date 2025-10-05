import { generateLongString } from "./functions.js";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import mysql2 from "mysql2";
import http from "http";
import { Server } from "socket.io";
const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const db = mysql2.createPool({
  host: "battlegroundmobileindia.in",
  user: "u423328347_celi",
  password: "Celi@4321",
  database: "u423328347_test",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// db.connect((err) => {
//     if (err) {
//         console.error('DB Connection Error:', err);
//     } else {
//         console.log('Connected to MySQL!');
//     }
// });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "main.html"))
);

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

app.post("/register", async (req, res) => {
  const { name, mobile, email, password, username } = req.body;
  console.log("Received registration data:", {
    name,
    mobile,
    email,
    password,
    username,
  });
  const hashedpwd = await bcrypt.hash(password, 8);

  db.query(
    "SELECT * FROM cusers WHERE LOWER(username) = LOWER(?) OR mobile = ?",
    [username, mobile],
    (err, result) => {
      if (err) throw err;
      if (result.length != 0) {
        res.json({
          result: "fail",
          data: "userexists",
        });
      } else {
        const session = generateLongString(64);
        const address = generateLongString(16);
        const invite = generateLongString(6);

        db.query(
          "INSERT INTO cusers (name, pwd, email, mobile, session, username, address) VALUES (?,?,?,?,?,?,?)",
          [name, hashedpwd, email, mobile, session, username, address],
          (err, result) => {
            if (err) throw err;
            db.query(
              "INSERT INTO userstatus (address) VALUES (?)",
              [address],
              (e, r) => {
                if (e) throw e;
              }
            );
            db.query(
              "INSERT INTO userpublic (InviteId, userAddress) VALUES (?, ?)",
              [invite, address],
              (e, r) => {
                if (e) throw e;
              }
            );
            db.query(
              "INSERT INTO usercontacts (address, contactData) VALUES (?, ?)",
              [address, ""],
              (e, r) => {
                if (e) throw e;
              }
            );
            res.json({ result: "ok", data: "added user" });
          }
        );
      }
    }
  );
});

app.post("/invite", async (req, res) => {
  try {
    const data = req.body;
    const session = data.session;
    const inviteCode = data.invite;

    const users = await query("SELECT * FROM cusers WHERE session = ?", [
      session,
    ]);
    if (users.length === 0) {
      return res.json({ result: "fail", message: "Invalid session" });
    }
    const user = users[0];
    const address = user.address;

    const publicRows = await query(
      "SELECT * FROM userpublic WHERE userAddress = ?",
      [address]
    );
    if (publicRows.length === 0) {
      return res.json({
        result: "fail",
        message: "User public data not found",
      });
    }
    const publicData = publicRows[0];

    if (publicData.InviteId === inviteCode) {
      return res.json({ result: "fail", message: "Cannot invite yourself" });
    }

    const contactRows = await query(
      "SELECT contactData FROM usercontacts WHERE address = ?",
      [address]
    );
    const currentContacts =
      contactRows.length > 0 && contactRows[0].contactData
        ? contactRows[0].contactData.split(",").filter((item) => item !== "")
        : [];

    if (currentContacts.includes(inviteCode)) {
      return res.json({ result: "fail", message: "Invite already exists" });
    }

    const updatedContactData =
      currentContacts.concat(inviteCode).join(",") + ",";
    await query("UPDATE usercontacts SET contactData = ? WHERE address = ?", [
      updatedContactData,
      address,
    ]);

    res.json({ result: "ok" });
  } catch (err) {
    console.error("Invite Route Error:", err);
    res.status(500).json({ result: "error", message: "Internal server error" });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { cookie } = req.body;

    // Step 1: Get user by session
    const users = await query("SELECT * FROM cusers WHERE session = ?", [
      cookie,
    ]);
    if (users.length === 0) {
      return res.json({ result: "fail" });
    }

    const user = users[0];
    const myAddress = user.address;

    // Step 2: Get contact data
    const contactRows = await query(
      "SELECT contactData FROM usercontacts WHERE address = ?",
      [myAddress]
    );
    const contacts =
      contactRows.length > 0 && contactRows[0].contactData
        ? contactRows[0].contactData.split(",").filter((item) => item !== "")
        : [];

    // Step 3: Get user's own InviteId
    const inviteRows = await query(
      "SELECT up.InviteId FROM cusers u JOIN userpublic up ON u.address = up.userAddress WHERE u.session = ?",
      [cookie]
    );
    const myInviteId = inviteRows[0]?.InviteId || null;

    // Step 4: If no contacts, return only user's own data
    if (contacts.length < 1) {
      return res.json({
        result: "ok",
        myInviteId,
        address: myAddress,
      });
    }

    // Step 5: Get addresses of contacts
    const contactAddressesRows = await query(
      "SELECT userAddress FROM userpublic WHERE InviteId IN (?)",
      [contacts]
    );
    const contactAddresses = contactAddressesRows.map((r) =>
      r.userAddress.trim()
    );

    // Step 6: Get user info for contact addresses
    const userData = await query(
      "SELECT name, username, address FROM cusers WHERE address IN (?)",
      [contactAddresses]
    );

    // Step 7: Return all data
    return res.json({
      result: "ok",
      userData,
      myInviteId,
      address: myAddress,
    });
  } catch (err) {
    console.error("Verify Route Error:", err);
    return res
      .status(500)
      .json({ result: "error", message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log({ email, password });
  db.query(
    "SELECT * FROM cusers WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        res.json({ result: "fail", data: "nodata" });
        return;
      }
      const user = result[0];
      const match = await bcrypt.compare(password, user.pwd);
      console.log(match);
      if (match) {
        let newsession = generateLongString(64);
        db.query(
          "UPDATE cusers SET session = ? WHERE session = ?",
          [newsession, user.session],
          (err, result) => {
            if (err) throw err;
          }
        );
        console.log(newsession);
        res.json({
          result: "ok",
          data: "loggedin",
          session: newsession,
        });
      } else {
        res.json({
          result: "fail",
          data: "false",
        });
      }
    }
  );
});

app.post("/getuserdata", (req, res) => {
  const { username } = req.body;
  //get last message too
  db.query(
    "SELECT address, name FROM cusers WHERE username = ?",
    [username],
    (e, r) => {
      if (e) throw e;
      res.send({
        data: r[0],
      });
    }
  );
});

app.post("/getchats", (req, res) => {
  const { saddr, raddr } = req.body;
  db.query(
    "SELECT * FROM chats WHERE (senderaddr = ? AND recieveaddr = ?) OR (senderaddr = ? AND recieveaddr = ?)",
    [saddr, raddr, raddr, saddr],
    (e, r) => {
      if (e) throw e;
      let messagedata = r.map((data) => ({
        mid: data.id,
        seaddr: data.senderaddr,
        readdr: data.recieveaddr,
        message: data.message,
        date: data.created_at,
        read: data.isread,
        sent: data.issent,
      }));
      res.json(messagedata);
    }
  );
});

app.post("/sendMsg", (req, res) => {
  const { saddr, raddr, message, invite } = req.body;
  console.log("messages sending")
  db.query(
    "SELECT contactData FROM usercontacts WHERE address = ?",
    [raddr],
    async (e, r) => {
      if (e) throw e;
      if (r[0]) {
        const rawData = r[0].contactData;
        const contacts = rawData
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x.length > 0);
        console.log(contacts);
      }
      if(contacts && !contacts.includes(invite)) {
        console.log("adding invite");
        const uContactData = contacts.concat(invite).join(",") + ",";
        await query("UPDATE usercontacts SET contactData = ? WHERE address = ?", [
        uContactData,
        raddr,
        ]);
        
    }
    }
  );

  

  db.query(
    "INSERT INTO chats(senderaddr, recieveaddr, message, isread, issent, type) VALUES (?,?,?,?,?,?)",
    [saddr, raddr, message, 0, 1, "message"],
    (e, r) => {
      if (e) throw e;
      res.json({
        status: true,
      });
    }
  );
  console.log("message sent");
});

const roomusers = {};

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("register", (address) => {
    socket.join(address); // join a room
    console.log(`${address} joined their room`);

    if (!roomusers[address]) {
      roomusers[address] = [];
    }
    roomusers[address].push(address);
  });

  socket.on("sendMsg", ({ saddr, raddr, message }) => {
    if (roomusers[raddr] && roomusers[raddr].length > 0) {
      roomusers[raddr].forEach((socketId) => {
        io.to(socketId).emit("newMessage", {
          saddr,
          raddr,
          message,
          date: new Date(),
        });
      });
    }

    if (roomusers[saddr] && roomusers[saddr].length > 0) {
      roomusers[saddr].forEach((socketId) => {
        io.to(socketId).emit("newMessage", {
          saddr,
          raddr,
          message,
          date: new Date(),
        });
      });
    }
  });

  socket.on("disconnect", () => {
    for (let room in roomusers) {
      roomusers[room] = roomusers[room].filter((id) => id !== socket.id);

      if (roomusers[room].length === 0) {
        delete roomusers[room];
      }
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("server running");
});
