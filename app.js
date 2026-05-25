const socket = new WebSocket(
    "wss://jos-server.onrender.com/ws"
);

// =====================================
// SOCKET CONNECTED
// =====================================

socket.onopen = function () {

    console.log("Admin Connected");

    socket.send(JSON.stringify({

        type: "admin_register"
    }));
};

// =====================================
// RECEIVE EVENTS
// =====================================

socket.onmessage = function (event) {

    const data = JSON.parse(event.data);

    // =================================
    // TOPOLOGY UPDATE
    // =================================
    if (data.type === "topology_update") {

        renderOnlineUsers(
            data.online_users
        );

        renderTopology(
            data.topology
        );
    }

    // =================================
    // APPROVAL REQUEST
    // =================================
    else if (
        data.type === "approval_request"
    ) {

        renderRequest(data);
    }

    // =================================
    // LIVE MESSAGE
    // =================================
    else if (
        data.type === "admin_message"
    ) {

        renderMessage(data);
    }
};

// =====================================
// ONLINE USERS
// =====================================

function renderOnlineUsers(users) {

    const onlineUsers =
        document.getElementById(
            "onlineUsers"
        );

    onlineUsers.innerHTML = "";

    users.forEach(user => {

        onlineUsers.innerHTML += `

            <li>${user}</li>

        `;
    });
}

// =====================================
// TOPOLOGY
// =====================================

function renderTopology(topology) {

    const topologyDiv =
        document.getElementById(
            "topology"
        );

    topologyDiv.innerHTML = "";

    for (const user in topology) {

        topologyDiv.innerHTML += `

            <div class="message">

                ${user}
                ↔
                ${topology[user].join(", ")}

            </div>

        `;
    }
}

// =====================================
// REQUESTS
// =====================================

function renderRequest(data) {

    const requests =
        document.getElementById(
            "requests"
        );

    const requestDiv =
        document.createElement("div");

    requestDiv.className = "request";

    requestDiv.id = data.request_id;

    requestDiv.innerHTML = `

        <p>

            <b>${data.from}</b>

            wants to

            <b>${data.action}</b>

            with

            <b>${data.to}</b>

        </p>

        <button
            class="approve"
            onclick="approveRequest(
                '${data.request_id}',
                true
            )"
        >
            Approve
        </button>

        <button
            class="reject"
            onclick="approveRequest(
                '${data.request_id}',
                false
            )"
        >
            Reject
        </button>
    `;

    requests.appendChild(requestDiv);
}

// =====================================
// APPROVE / REJECT
// =====================================

function approveRequest(
    requestId,
    approved
) {

    socket.send(JSON.stringify({

        type: "admin_approval",

        request_id: requestId,

        approved: approved
    }));

    const requestDiv =
        document.getElementById(
            requestId
        );

    if (requestDiv) {

        requestDiv.remove();
    }
}

// =====================================
// LIVE MESSAGES
// =====================================

function renderMessage(data) {

    const messages =
        document.getElementById(
            "messages"
        );

    messages.innerHTML += `

        <div class="message">

            <b>${data.from}</b>

            →

            <b>${data.to}</b>

            :

            ${data.message}

        </div>

    `;

    messages.scrollTop =
        messages.scrollHeight;
}