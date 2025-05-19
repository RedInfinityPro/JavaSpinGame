const updateLogs = [
    { version: "0.0.0", notes: "Initial commit." },
    { version: "0.0.1", notes: "Adding files." },
    { version: "0.0.2", notes: "Building a better player inventory and better dice rolls." },
    { version: "0.0.3", notes: "Adding a canvas to allow the players to draw on the canvas." },
    { version: "0.0.4", notes: "Adding better item usage in inventory." },
    { version: "0.0.5", notes: "Known bug: the map does not zoom correctly." },
    { version: "0.0.6", notes: "Known - Adding a better usage for equipped items and a better map." },
    { version: "0.0.7", notes: "Fixing removing content bug." },
    { version: "0.0.8", notes: "Allowing the notepad to move around, fixing bugs, and reformatting code." },
    { version: "0.0.9", notes: "Adding more goals to fix." },
    { version: "0.1.0", notes: "Newest update before changing layout." },
    { version: "0.1.1", notes: "Professionalizing the website layout." },
    { version: "0.1.2", notes: "Adding settings window, fixing inventory items to add cost, fixing format." },
    { version: "0.1.3", notes: "Better login screen." },
    { version: "0.1.4", notes: "Removing the settings window for now, updating canvas, and inventory items." },
    { version: "0.1.5", notes: "Updating user status bars." },
    { version: "0.1.6", notes: "Adding a update screen to settings screen." },
    { version: "0.1.7", notes: "Adding more items to the game." }
];

function populateUpdateButtons() {
    const container = document.getElementById("update-buttons-container");
    updateLogs.forEach(log => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "update-btn";
        button.innerText = `Update ${log.version}`;
        button.title = log.notes;
        container.appendChild(button);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    populateUpdateButtons();
});