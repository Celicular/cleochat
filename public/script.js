import { getCookie } from "./functions.js";
import API_URL from "./config.js";
const socket = io(`${API_URL}`);

let startLoad = false;
let currentMidS = [];
const sidebar = document.querySelector(".sidebar");
var myInvite = "";

const showChat = document.querySelector(".showChat");

function loadsidebar() {
  sidebar.style.display = "flex";
  sidebar.classList.add("comeIn");
}

showChat.addEventListener("click", (e) => {
  loadsidebar();
});

if (!localStorage.getItem("currentChatRecieverAddress")) {
  loadsidebar();
}

const reduceSidebar = () => {
  sidebar.style.display = "none";
};

function showDialog(modal) {
  document.getElementById(`${modal}`).showModal();
}

function closeDialog(modal) {
  document.getElementById(`${modal}`).close();
}

async function addInvite(inviteid, session) {
  const res = await fetch("/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: session,
      invite: inviteid,
    }),
  });

  const data = await res.json();
  console.log(data);
  if (data.result === "fail due to invite exist") {
    alert("user already exists");
  } else {
    if (checkSession()) {
      alert("user added");
    } else {
      alert("Some server error occured i guess... ahhh fuck you");
    }
  }
}

const cookie = getCookie("userSession");

async function checkSession() {
  const cookie = getCookie("userSession");
  const chatgroup = document.querySelector(".chatgroup");
  chatgroup.innerHTML = '';

  if (cookie) {
    const res = await fetch("/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookie }),
    });

    const data = await res.json();
    console.log(data.result);
    console.log(data.userData);
    localStorage.setItem("addressUser", data.address);

    if (data.userData) {
      data.userData.forEach((user) => {
        const chatCard = document.createElement("div");
        chatCard.classList.add("chatCard");

        chatCard.innerHTML = `
                <div class="namedata" data-username="${user.username}">
                        <h3>${user.name.split(" ")[0]}</h3>
                        <h2>${user.username}</h2>
                    </div>
                    <p>offline</p>
            `;

        chatgroup.appendChild(chatCard);
      });
    }

    document.querySelector(
      ".invID"
    ).textContent = `My Invite ID: ${data.myInviteId}`;
    console.log(data.myInviteId);
    myInvite = data.myInviteId; 


    loadMessages(
      localStorage.getItem("addressUser"),
      localStorage.getItem("currentChatRecieverAddress")
    );

    return data.result === "ok";
  }
  return false;
}

document.addEventListener("DOMContentLoaded", async () => {
  setdata(null);

  const valid = await checkSession();
  if (!valid) {
    alert("Someone Logged in From another place");
    window.location.href = "login.html";
  }
  document.querySelector(".addContact").addEventListener("click", (e) => {
    showDialog("contactAdd");
  });

  document
    .querySelector(".closeContactDialog")
    .addEventListener("click", (e) => {
      console.log("closed");
      closeDialog("contactAdd");
    });

  const dinput = document.querySelectorAll(".d-value");

  dinput.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      if (input.value.length > 0 && index < dinput.length - 1) {
        dinput[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        dinput[index - 1].focus();
      }
    });
  });

  let errorCnt = 0;

  const submitContact = document.getElementById("submitContact");
  submitContact.addEventListener("click", (e) => {
    e.preventDefault();
    let contactId = "";

    dinput.forEach((inp, i) => {
      if (inp.value === "") {
        errorCnt++;
      }
    });
    if (errorCnt > 0) {
      alert("Invalid Otp Retry");
      errorCnt = 0;
    } else {
      dinput.forEach((inp) => {
        contactId += inp.value;
      });
      console.log(contactId);
      addInvite(contactId, cookie);
    }
  });
});

const messages = document.querySelectorAll(".message");
const defaultgap = "25px";

function fixMessageGap() {
  messages.forEach((msg, i) => {
    if (i === 0) {
      msg.style.marginTop = defaultgap;
    } else {
      let prev = messages[i - 1];
      if (
        prev.classList.contains("recieve") &&
        msg.classList.contains("recieve")
      ) {
        msg.classList.add("receivecollapse");
        prev.style.borderBottomLeftRadius = "0";
      } else if (
        prev.classList.contains("sent") &&
        msg.classList.contains("sent")
      ) {
        msg.classList.add("sentcollapse");
        prev.style.borderBottomRightRadius = "0";
      }
    }
  });
}

if (localStorage.getItem("currentChatName") === "") {
  document.querySelector(".chatmessages").innerHTML = "";
  document.querySelector(".chatnamedata>h2").style.display = "none";
}

function setdata(username) {
  socket.emit("register", localStorage.getItem("addressUser"));
  fetch("/getuserdata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log(data.data.name);
      localStorage.setItem("currentChatName", data.data.name);
      localStorage.setItem("currentChatRecieverAddress", data.data.address);
      document.querySelector(".chatnamedata>h3").textContent = localStorage
        .getItem("currentChatName")
        .split(" ")[0];
      document.querySelector(".chatnamedata>h2").style.display = "";
      currentMidS = [];
      loadMessages(
        localStorage.getItem("addressUser"),
        localStorage.getItem("currentChatRecieverAddress")
      );
      startLoad = true;
    });
}

async function loadMessages(sendaddress, recieveaddress) {
  console.log(sendaddress, recieveaddress);

  if (!recieveaddress) return;
  const chatbox = document.querySelector(".chatmessages");
  const currentMessages = chatbox.innerHTML;
  console.log(currentMessages);
  if (currentMidS.length == 0) {
    chatbox.innerHTML = "";
  }
  await fetch("/getchats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      saddr: sendaddress,
      raddr: recieveaddress,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      data.forEach((d, i) => {
        if (currentMidS.includes(d.mid)) {
          return;
        } else {
          currentMidS.push(d.mid);
        }
        const chatmessage = document.createElement("p");
        chatmessage.dataset.id = d.mid;
        chatmessage.classList.add("message");
        if (d.seaddr == localStorage.getItem("addressUser")) {
          chatmessage.classList.add("sent");
        } else {
          chatmessage.classList.add("recieve");
        }

        chatmessage.textContent = d.message;
        if (d.mid == data.length) {
          chatmessage.style.marginBottom = "20px";
        }
        chatbox.appendChild(chatmessage);
      });

      fixMessageGap();
    });

  chatbox.scrollTo({
    top: chatbox.scrollHeight,
    behavior: "smooth",
  });
}

function sendMessage(sendaddress, recieveaddress) {
  const messagebox = document.querySelector(".sendmessage");
  console.log(messagebox.value);
  console.log("sender: ", sendaddress);
  console.log("receiver: ", recieveaddress);

  if (!messagebox.value) {
    return;
  }

  if (!recieveaddress) {
    alert("No Contact Selected!");
    return;
  }

  fetch(`${API_URL}/sendMsg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      saddr: sendaddress,
      raddr: recieveaddress,
      message: messagebox.value,
      invite: myInvite
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status) {
        loadMessages(
          localStorage.getItem("addressUser"),
          localStorage.getItem("currentChatRecieverAddress")
        );
        console.log("ok");
      } else {
        console.error("fail");
      }
    });
  socket.emit("sendMsg", {
    saddr: sendaddress,
    raddr: recieveaddress,
  });

  loadMessages(
    localStorage.getItem("addressUser"),
    localStorage.getItem("currentChatRecieverAddress")
  );
  messagebox.value = "";
}

socket.on("newMessage", (data) => {
  console.log(data);
  loadMessages(
    localStorage.getItem("addressUser"),
    localStorage.getItem("currentChatRecieverAddress")
  );
});

document.querySelector(".send").addEventListener("click", (e) => {
  sendMessage(
    localStorage.getItem("addressUser"),
    localStorage.getItem("currentChatRecieverAddress")
  );
});

document.querySelector(".chatnamedata>h3").textContent = localStorage
  .getItem("currentChatName")
  .split(" ")[0];

document.addEventListener("click", (e) => {
  const card = e.target.closest(".chatCard");
  if (!card) return;

  if (window.innerWidth < 768) {
    reduceSidebar();
  }

  let namedata = card.querySelector(".namedata");
  const username = namedata.dataset.username;
  setdata(username);
});

document.querySelector(".logout").addEventListener("click", (e) => {
  document.cookie = "userSession=;";
  window.location.href = "login.html";
});
