// DOM Elements
const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const winnerValue = document.getElementById("winnerValue");
const board = document.querySelector(".board");
// Variables
let activePiece = null;
let isSpinning = false;
let isDrawing = false;
let isPanning = false;
let tool = "pen";
const ruleTracker = {};
const rollStoryTracker = {};
// Canvas properties
let canvas, ctx;
let lastX = 0, lastY = 0;
let scale = 1, offsetX = 0, offsetY = 0;
// Constants
const percentageIncrease = Math.random() * 0.9 + 0.1;

const BASE_STATS = {
    health: 40,
    armor: 15,
    attack: 15,
    speed: 30,
    magic: 30,
};

let currentStats = {
    health: 20,
    magic: 30,
};

// Values for each segment
const values = [
    "Wildcard Trickster",
    "Apocalyptic Survivor",
    "Mad Scientist",
    "Blind Play",
    "Rags to Riches",
    "Riches to Rags",
    "Cursed Wanderer",
    "Golden Touch"
];

const values_def = [
    "Chance at the start of each turn to randomly select a different player to go first",
    "Chance when collecting resources to receive nothing instead",
    "Chance for any action to have a completely random outcome",
    "Chance to hide resource information from all players for one round",
    "Start with fewer resources but gain 10% bonus on all future acquisitions",
    "Start with double resources but lose 5% of total after each turn",
    "Chance of negative events, but they only have half effect",
    "Chance to double any resource gained, but 5% chance to lose a random resource"
]

const itemsDatabase = [
    {
        icon: "fa-gavel",
        name: "Warhammer",
        dice: "1d8",
        description: "A heavy, two-handed hammer used for crushing opponents",
        type: "weapon"
    },
    {
        icon: "fa-key",
        name: "Skeleton Key",
        description: "Opens any non-magical lock with ease",
        type: "tool"
    },
    {
        icon: "fa-hammer",
        name: "War Maul",
        dice: "1d12",
        description: "Massive hammer capable of dealing devastating blows",
        type: "weapon"
    },
    {
        icon: "fa-medkit",
        name: "Medkit",
        dice: "1d6",
        description: "Restores 1d6 health points when used",
        type: "consumable"
    },
    {
        icon: "fa-flask",
        name: "Potion of Healing",
        dice: "1d6",
        description: "Magical liquid that restores 1d6 health when drunk",
        type: "consumable"
    },
    {
        icon: "fa-ring",
        name: "Ring of Power",
        description: "Ancient ring that enhances the wearer's magical abilities",
        type: "accessory"
    },
    {
        icon: "fa-shoe-prints",
        name: "Boots of Speed",
        description: "Increases movement speed by 10 feet",
        type: "armor"
    },
    {
        icon: "fa-book",
        name: "Spell Book",
        dice: "1d100",
        description: "Contains powerful spells and arcane knowledge",
        type: "magic"
    },
    {
        icon: "fa-map",
        name: "Ancient Map",
        description: "Shows the location of a hidden treasure",
        type: "tool"
    },
    {
        icon: "fa-suitcase",
        name: "Adventurer's Pack",
        description: "Contains basic survival equipment for adventuring",
        type: "tool"
    },
    {
        icon: "fa-shield-alt",
        name: "Shield",
        dice: "1d10",
        description: "Provides additional defense against attacks",
        type: "armor"
    },
    {
        icon: "fa-bomb",
        name: "Grenade",
        dice: "1d20",
        description: "Explodes on impact, dealing 1d20 damage in a 10ft radius",
        type: "weapon"
    },
    {
        icon: "fa-feather",
        name: "Phoenix Feather",
        description: "Can resurrect a fallen ally once",
        type: "consumable"
    },
    {
        icon: "fa-skull",
        name: "Cursed Totem",
        dice: "1d4",
        description: "Deals 1d4 damage to enemies but also harms the wielder",
        type: "magic"
    }
].map(item => ({ ...item, percentage: 0 }));

function showForm(formId) {
    document.getElementById(formId).style.opacity = 1;
    document.getElementById(formId).style.display = 'block';

}

function closeForm(formId) {
    document.getElementById(formId).style.opacity = 0;
    document.getElementById(formId).style.display = 'none';
}

function percentage() {
    // Format to 2 decimal places and update the label
    document.getElementById('percentage-label').innerText = percentageIncrease.toFixed(2) + '%';
}

// add content to panel
function addRule(ruleName, description) {
    // First-time rule: assign random starting % between 0.1 and 1%
    if (!ruleTracker[ruleName]) {
        const button = document.createElement("button");
        button.classList.add("track");
        if (ruleName == "Rule 1" || ruleName == "Rule 2" || ruleName == "Rule 3") {
            button.innerText = `100% change - ${ruleName}`;
        } else {
            button.innerText = `${percentageIncrease.toFixed(2)}% chance - ${ruleName}`;
        }

        button.title = description;
        document.querySelector(".content").appendChild(button);
        // Store button and current percentage
        ruleTracker[ruleName] = {
            button: button,
            percentage: percentageIncrease
        };
    } else {
        // Rule exists: increase percentage
        ruleTracker[ruleName].percentage += percentage_increase; // You can tweak this increment

        const newPercent = ruleTracker[ruleName].percentage;

        // Update text
        ruleTracker[ruleName].button.innerText = `${newPercent.toFixed(2)}% chance - ${ruleName}`;
        ruleTracker[ruleName].button.title = description;
    }
}

function clearHistory() {
    for (const type in rollTracker) {
        if (rollTracker[type].button) {
            rollTracker[type].button.remove(); // Remove button from DOM
        }
    }
    // Clear the tracker
    for (const key in rollTracker) {
        delete rollTracker[key];
    }
}

// rotate wheel
function rotateWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.style.opacity = '0.1';
    winnerValue.classList.remove('show');
    // Random number of rotations (between 1 and 10)
    const rotations = 1 + Math.random() * 5;
    // Random angle for additional rotation (to determine winner)
    const extraAngle = Math.floor(Math.random() * 360);
    // Total rotation angle
    const totalRotation = rotations * 360 + extraAngle;
    // Apply rotation to the wheel with CSS transition
    wheel.style.transform = `rotate(${totalRotation}deg)`;
    // Calculate winner after spin is complete
    setTimeout(() => {
        // Calculate which segment is at the top when wheel stops
        // We need to calculate this based on the final rotation angle
        // Each segment is 45 degrees (360/8)
        const finalAngle = (totalRotation % 360);
        const correctedAngle = (360 - finalAngle + 22.5) % 360;
        const segmentIndex = Math.floor(correctedAngle / 45) % 8;
        const winValue = values[segmentIndex];
        const winDef = values_def[segmentIndex];
        addRule(winValue, winDef);
        // Display winner
        winnerValue.querySelector('span').textContent = winValue;
        winnerValue.classList.add('show');
        // Re-enable spin button
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.style.opacity = '1';
    }, 5000); // 5 seconds for the wheel to complete spinning
}

function search_elements() {
    let input = document.getElementById('searchbar').value.toLowerCase().trim();
    let buttons = document.querySelectorAll('.track');

    buttons.forEach(button => {
        let text = button.innerText.toLowerCase();
        if (text.includes(input)) {
            button.style.display = "block";
        } else {
            button.style.display = "none";
        }
    });
}

function rollDice(dice_type, amount, increase) {
    let totalValue = 0;
    let endvalue = 0;
    const increase_2 = Number(increase);
    if (!amount) return;

    switch (dice_type) {
        case "1d4": endvalue = 4; break;
        case "1d6": endvalue = 6; break;
        case "1d8": endvalue = 8; break;
        case "1d10": endvalue = 10; break;
        case "1d12": endvalue = 12; break;
        case "1d20": endvalue = 20; break;
        case "1d100": endvalue = 100; break;
        default: return null;
    }

    // Perform the roll(s)
    for (let i = 0; i < amount; i++) {
        const rawRoll = Math.floor(1 + Math.random() * endvalue);
        const rollValue = increase_2 ? rawRoll + increase_2 : rawRoll;
        totalValue += rollValue;
        addRoll(dice_type, totalValue, increase_2, rawRoll);
    }

    // Add the total for multiple dice
    if (amount > 1) {
        const totalButton = document.createElement("button");
        totalButton.classList.add("track", "total");
        totalButton.innerText = `Total: ${totalValue}`;
        document.querySelector(".content").appendChild(totalButton);
        const uniqid = Date.now();
        rollTracker[uniqid] = { button: totalButton };
    }

    return totalValue;
}

function addRoll(type, total, increase, rawRoll) {
    const button = document.createElement("button");
    button.classList.add("track");
    let displayText = `Rolled ${type} → ${rawRoll}`;
    if (increase) {
        displayText += ` + ${increase} = ${total}`;
    }
    button.innerText = displayText;
    document.querySelector(".content").appendChild(button);
    const uniqid = Date.now();
    rollTracker[uniqid] = { button: button };
}

function addAction(name, type, dice_type = null) {
    let story = "";
    // Specific handling for different item types
    switch (name) {
        case "Skeleton Key":
            story = "You use a Skeleton Key.";
            removeItemFromInventory(name);
            break;
        case "Ring of Power":
            story = "You feel a surge of strength.";
            break;
        case "Boots of Speed":
            story = "You dash forward with incredible speed.";
            break;
        case "Ancient Map":
            story = "You found a new area, one map used.";
            removeItemFromInventory(name);
            break;
        case "Adventurer's Pack":
            story = "You have found some useful supplies.";
            removeItemFromInventory(name);
            break;
        case "Phoenix Feather":
            story = "1 Phoenix Feather used to revive.";
            removeItemFromInventory(name);
            break;
        default:
            story = `You used ${name}.`;
            // Remove consumable items by default
            if (type === "consumable") {
                removeItemFromInventory(name);
            }
            break;
    }

    // Create a button to display the story
    const button = document.createElement("button");
    button.classList.add("track");
    button.innerText = story;
    document.querySelector(".content").appendChild(button);
    const uniqid = Date.now();
    rollTracker[uniqid] = { button: button };

    // Update status bar
    updateStatusBar(name, type);

    return story;
}

function removeItemFromInventory(itemName) {
    const inventoryItems = document.querySelectorAll('.inventory-grid .item-slot');
    for (let item of inventoryItems) {
        if (item.dataset.itemName === itemName) {
            // If the item is equipped, remove from equipped slots too
            const equippedItem = document.querySelector(`.equip-slot .item-slot[data-original-id="${item.dataset.itemId}"]`);

            if (equippedItem) {
                const parentSlot = equippedItem.closest('.equip-slot');
                parentSlot.classList.add('empty-slot');
                parentSlot.innerHTML = '';

                // Add placeholder icon back
                const placeholder = document.createElement("i");
                placeholder.className = "fas fa-plus";
                placeholder.style.opacity = "0.3";
                parentSlot.appendChild(placeholder);
            }

            // Remove the item from the inventory grid
            item.remove();
            break;
        }
    }
}


function generateItem(amount) {
    const inventory = document.querySelector(".inventory-grid");
    inventory.innerHTML = ''; // Clear existing items

    for (let i = 0; i < amount; i++) {
        // Get a random item from our database
        const randomItem = itemsDatabase[Math.floor(Math.random() * itemsDatabase.length)];
        const randomPercentage = Math.random() * (100 - 1) + 1;

        // Create item slot
        const itemSlot = document.createElement("div");
        itemSlot.className = "item-slot";
        itemSlot.dataset.itemId = i;
        itemSlot.dataset.itemName = randomItem.name;
        itemSlot.dataset.itemType = randomItem.type;
        itemSlot.dataset.percentage = randomPercentage.toFixed(0);
        itemSlot.title = randomItem.description;

        // Create icon
        const icon = document.createElement("i");
        icon.className = "fas " + randomItem.icon;

        // Append icon to slot
        itemSlot.appendChild(icon);

        // Add dice label if applicable
        if (randomItem.dice) {
            itemSlot.dataset.itemDice = randomItem.dice;
            const label = document.createElement("label");
            const percentageLabel = document.createElement("p");
            label.innerText = randomItem.dice;
            percentageLabel.innerText = "+" + randomPercentage.toFixed(0);
            itemSlot.appendChild(percentageLabel);
            itemSlot.appendChild(label);
        }

        // Store item description
        itemSlot.dataset.itemDesc = randomItem.description;

        // Correct mouse handling
        itemSlot.addEventListener("mousedown", function (event) {
            event.preventDefault();

            switch (event.button) {
                case 0: // Left click
                    toggleEquip(this);
                    break;
                case 1: // Middle click
                    console.log("Middle click");
                    break;
                case 2: // Right click
                    if (this.classList.contains('equipped')) {
                        // Only roll dice if this item has dice
                        if (this.dataset.itemDice) {
                            rollDice(this.dataset.itemDice, 1, this.dataset.percentage);
                        }

                        // Always add the action
                        addAction(this.dataset.itemName, this.dataset.itemType, this.dataset.itemDice);

                        // For consumable items without dice, remove after use
                        if (!this.dataset.itemDice && this.dataset.itemType === "consumable") {
                            const parentSlot = this.parentElement;
                            if (parentSlot.classList.contains('equip-slot')) {
                                parentSlot.classList.add('empty-slot');
                                parentSlot.innerHTML = '';

                                // Add placeholder icon back
                                const placeholder = document.createElement("i");
                                placeholder.className = "fas fa-plus";
                                placeholder.style.opacity = "0.3";
                                parentSlot.appendChild(placeholder);
                            }
                        }
                    }
                    break;
            }
        });

        // Prevent right-click menu
        itemSlot.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });

        inventory.appendChild(itemSlot);
    }
}

function toggleEquip(itemElement) {
    // Visual feedback
    itemElement.classList.add('pulse');
    setTimeout(() => {
        itemElement.classList.remove('pulse');
    }, 300);

    if (itemElement.classList.contains('equipped')) {
        // Item is equipped, so unequip it
        unequipItem(itemElement);
    } else {
        // Item is not equipped, so equip it
        equipItem(itemElement);
    }
}

// Equip an item (move to equipped area)
function equipItem(itemElement) {
    // Find first empty equip slot
    const equippedSlots = document.querySelectorAll('.equip-slot.empty-slot');
    if (equippedSlots.length === 0) {
        // No empty slots available
        alert("You have no empty equipment slots!");
        return;
    }

    const firstEmptySlot = equippedSlots[0];

    // Clone the item
    const clonedItem = itemElement.cloneNode(true);

    // Update classes and data attributes
    clonedItem.classList.add('equipped');
    clonedItem.dataset.originalId = itemElement.dataset.itemId;

    // Add click handler to unequip
    clonedItem.addEventListener("mousedown", function (event) {
        event.preventDefault();

        switch (event.button) {
            case 0: // Left click
                toggleEquip(this);
                break;
            case 1: // Middle click
                console.log("Middle click");
                break;
            case 2: // Right click
                if (this.classList.contains('equipped')) {
                    // Calculate percentage bonus properly (ensuring it's a number)
                    const percentageValue = parseFloat(this.dataset.percentage) || 0;
                    const randomPercentage = Math.random() * percentageValue;

                    // Only roll dice if this item has dice
                    if (this.dataset.itemDice) {
                        rollDice(this.dataset.itemDice, 1, randomPercentage.toFixed(0));
                    }

                    // Always add the action
                    addAction(this.dataset.itemName, this.dataset.itemType, this.dataset.itemDice);

                    // For consumable items without dice, remove after use
                    if (!this.dataset.itemDice && this.dataset.itemType === "consumable") {
                        const parentSlot = this.parentElement;
                        parentSlot.classList.add('empty-slot');
                        parentSlot.innerHTML = '';

                        // Add placeholder icon back
                        const placeholder = document.createElement("i");
                        placeholder.className = "fas fa-plus";
                        placeholder.style.opacity = "0.3";
                        parentSlot.appendChild(placeholder);

                        // Update original inventory item
                        const originalId = this.dataset.originalId;
                        if (originalId) {
                            const originalItem = document.querySelector(`.inventory-grid .item-slot[data-item-id="${originalId}"]`);
                            if (originalItem) {
                                originalItem.classList.remove('equipped');
                            }
                        }
                    }
                }
                break;
        }
    });

    // Remove placeholder icon from slot
    firstEmptySlot.innerHTML = '';

    // Add item to equip slot
    firstEmptySlot.appendChild(clonedItem);
    firstEmptySlot.classList.remove('empty-slot');

    // Mark original inventory item as equipped
    itemElement.classList.add('equipped');

    // Update character stats based on equipped item
    updateCharacterStats();
}

// Unequip an item (return to inventory)
function unequipItem(equippedItem) {
    // Handle unequipping from equipment slot
    if (equippedItem.parentElement.classList.contains('equip-slot')) {
        // Mark parent slot as empty
        const parentSlot = equippedItem.parentElement;
        parentSlot.classList.add('empty-slot');

        // Add placeholder icon back
        parentSlot.innerHTML = '';
        const placeholder = document.createElement("i");
        placeholder.className = "fas fa-plus";
        placeholder.style.opacity = "0.3";
        parentSlot.appendChild(placeholder);

        // Find original inventory item and update its status
        const originalId = equippedItem.dataset.originalId;
        if (originalId) {
            const originalItem = document.querySelector(`.inventory-grid .item-slot[data-item-id="${originalId}"]`);
            if (originalItem) {
                originalItem.classList.remove('equipped');
            }
        }
    }
    // Handle direct click on inventory item
    else {
        // Find corresponding equipped item
        const itemId = equippedItem.dataset.itemId;
        const equippedVersion = document.querySelector(`.equip-slot .item-slot[data-original-id="${itemId}"]`);

        if (equippedVersion) {
            // Trigger unequip on the equipped version
            toggleEquip(equippedVersion);
        }

        // Update inventory item status
        equippedItem.classList.remove('equipped');
    }

    // Update character stats
    updateCharacterStats();
}

// Update character stats based on equipped items
function updateCharacterStats() {
    // This is where you would calculate and update character stats
    // based on equipped items

    // For this demo, we'll just simulate it with a visual feedback
    const statsBar = document.querySelector('.stats-bar');
    statsBar.style.backgroundColor = 'rgba(117, 121, 231, 0.2)';
    setTimeout(() => {
        statsBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    }, 300);
}

function equippedInventoryGenerate(amount) {
    const equipInventory = document.getElementById("equippedSlot");
    equipInventory.innerHTML = '';
    for (let i = 0; i < amount; i++) {
        const equipSlot = document.createElement("div");
        equipSlot.className = "equip-slot empty-slot";
        equipSlot.dataset.slotIndex = i;
        // Add a subtle placeholder icon
        const placeholder = document.createElement("i");
        placeholder.className = "fas fa-plus";
        placeholder.style.opacity = "0.3";
        equipSlot.appendChild(placeholder);
        equipInventory.appendChild(equipSlot);
    }
}

function updateStatusBar(itemName, itemType) {
    const statusBar = document.querySelector('.stats-bar');
    // Create a status update element
    const statusUpdate = document.createElement('div');
    statusUpdate.classList.add('status-update');

    // Customize status message based on item type
    switch (itemType) {
        case "consumable":
            statusUpdate.innerText = `Consumed: ${itemName}`;
            statusUpdate.style.color = 'orange';
            break;
        case "key":
            statusUpdate.innerText = `Used: ${itemName}`;
            statusUpdate.style.color = 'green';
            break;
        default:
            statusUpdate.innerText = `Used: ${itemName}`;
            statusUpdate.style.color = 'blue';
    }

    // Animate status bar
    statusBar.style.backgroundColor = 'rgba(117, 121, 231, 0.4)';

    // Add status update to the bar
    statusBar.appendChild(statusUpdate);

    // Remove the status update after a few seconds
    setTimeout(() => {
        statusUpdate.remove();
        statusBar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    }, 3000);
}

function modifyItemHandler() {
    const itemSlots = document.querySelectorAll('.item-slot');
    itemSlots.forEach(slot => {
        slot.addEventListener("mousedown", function (event) {
            if (event.button === 2 && this.classList.contains('equipped')) {
                const itemName = this.dataset.itemName;
                const itemType = this.dataset.itemType;
                const itemDice = this.dataset.itemDice;

                // Roll dice if applicable
                if (itemDice) {
                    rollDice(itemDice, 1, this.dataset.percentage);
                }

                // Add action and potentially remove item
                addAction(itemName, itemType, itemDice);
            }
        });
    });
}

function setTool(selectedTool) {
    tool = selectedTool;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateCanvasPosition() {
    canvas.style.transform = `scale(${scale}) translate(${-offsetX}px, ${-offsetY}px)`;
    canvas.style.transformOrigin = 'top left';
}

spinBtn.addEventListener('click', rotateWheel);

document.addEventListener('DOMContentLoaded', function () {
    // Setup rules, items, etc.
    addRule('Rule 1', 'Every time the wheel spins, a new rule must be added.');
    addRule('Rule 2', 'No rules can be removed or changed during play.');
    addRule('Rule 3', 'Rules can stack over time, thus changing the chance of that rule being applied.');
    percentage();
    generateItem(10);
    equippedInventoryGenerate(6);

    // Initialize canvas
    canvas = document.getElementById("drawing-canvas");
    if (!canvas) {
        console.error("Canvas element not found.");
        return;
    }

    ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Failed to get 2D context.");
        return;
    }

    // Add event listeners to canvas
    canvas.addEventListener("mousedown", (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseup", () => {
        isDrawing = false;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.strokeStyle = tool === "pen" ? "white" : "#222";
        ctx.lineWidth = tool === "pen" ? 2 : 20;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX = x;
        lastY = y;
    });
});