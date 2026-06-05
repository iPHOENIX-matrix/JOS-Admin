const API_BASE =
    "https://jos-server.onrender.com";

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

    loadVehicles();
};

// =====================================
// RECEIVE EVENTS
// =====================================

socket.onmessage = function (event) {

    const data = JSON.parse(event.data);

    if (data.type === "topology_update") {

        renderOnlineUsers(
            data.online_users
        );

        renderTopology(
            data.topology
        );
    }

    else if (
        data.type === "approval_request"
    ) {

        renderRequest(data);
    }

    else if (
        data.type === "admin_message"
    ) {

        renderMessage(data);
    }
};

// =====================================
// VEHICLE REGISTRY
// =====================================

async function registerVehicle() {

    const vin =
        document.getElementById(
            "vin"
        ).value;

    const vehicleName =
        document.getElementById(
            "vehicleName"
        ).value;

    if (!vin || !vehicleName) {

        alert(
            "VIN and Vehicle Name required"
        );

        return;
    }

    const response =
        await fetch(
            `${API_BASE}/vehicle/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({

                    vin: vin,

                    vehicle_name:
                        vehicleName
                })
            }
        );

    const result =
        await response.json();

    if (result.success) {

        alert(
            "✅ Vehicle Registered Successfully"
        );

    } else {

        alert(
            "❌ Vehicle Registration Failed"
        );
    }

    loadVehicles();
}

async function deleteVehicle(vin) {

    const confirmDelete =
        confirm(
            `Delete Vehicle ${vin}?`
        );

    if (!confirmDelete) {

        return;
    }

    const response =
        await fetch(
            `${API_BASE}/vehicle/${vin}`,
            {
                method: "DELETE"
            }
        );

    const result =
        await response.json();

    if (result.success) {

        alert(
            "✅ Vehicle Deleted Successfully"
        );

        loadVehicles();

    } else {

        alert(
            "❌ Failed To Delete Vehicle"
        );
    }
}

async function loadVehicles() {

    const response =
        await fetch(
            `${API_BASE}/vehicles`
        );

    const vehicles =
        await response.json();

    renderVehicles(
        vehicles
    );
}

function renderVehicles(vehicles) {

    document.getElementById(
        "vehicleCount"
    ).innerText = vehicles.length;

    const table =
        document.getElementById(
            "vehicleTable"
        );

    table.innerHTML = `

        <table>

            <tr>
                <th>VIN</th>
                <th>Name</th>
                <th>Version</th>
                <th>Status</th>
                <th>Action</th>
            </tr>

        </table>

    `;

    const tableElement =
        table.querySelector("table");

    vehicles.forEach(vehicle => {

        tableElement.innerHTML += `

            <tr>

                <td>${vehicle.vin}</td>

                <td>${vehicle.vehicle_name}</td>

                <td>${vehicle.current_version}</td>

                <td>${vehicle.status}</td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteVehicle(
                            '${vehicle.vin}'
                        )"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;
    });
}

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

    requests.appendChild(
        requestDiv
    );
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
// LIVE MESSAGE
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