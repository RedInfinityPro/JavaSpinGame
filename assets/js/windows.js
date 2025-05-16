const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const notepad = document.getElementById('note-pad');
const penBtn = document.getElementById('pen-btn');
const eraserBtn = document.getElementById('eraser-btn');
const clearBtn = document.getElementById('clear-btn');
// Canvas properties
let tool = "pen";
let lastX = 0, lastY = 0;
let scale = 1, offsetX = 0, offsetY = 0;
let isDragging = false;
let isDrawing = false;
let notepadStartX = 0;
let notepadStartY = 0;

const BASE_STATS = {
    health: 40,
    armor: 15,
    attack: 15,
    speed: 30,
    magic: 30,
    gold: 0,
    level: 0,
    xp: 0,
};

let currentStats = {
    health: 40,
    magic: 30,
    xp: 0,
};

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
].map(item => ({ ...item, percentage: [0, 0] }));

// close/open form
function showForm(formId) {
    document.getElementById(formId).style.opacity = 1;
    document.getElementById(formId).style.display = 'block';
    const badge = document.getElementById("badge");
    if (formId == "note-pad") {
        notepadStartX = 0;
        notepadStartY = 0;
        badge.style.display = 'block';
        notepad.style.left = (notepadStartX) + 'px';
        notepad.style.top = (notepadStartY) + 'px';
    }
}

function closeForm(formId) {
    document.getElementById(formId).style.opacity = 0;
    document.getElementById(formId).style.display = 'none';
    const badge = document.getElementById("badge");
    if (formId == "note-pad") {
        notepadStartX = 0;
        notepadStartY = 0;
        badge.style.display = 'none';
        notepad.style.left = (notepadStartX) + 'px';
        notepad.style.top = (notepadStartY) + 'px';
    }
}

function clearHistory() {
    for (const type in rollStoryTracker) {
        if (rollStoryTracker[type].button) {
            rollStoryTracker[type].button.remove(); // Remove button from DOM
        }
    }
    // Clear the tracker
    for (const key in rollStoryTracker) {
        delete rollStoryTracker[key];
    }
}

function generateItem(amount, except = null) {
    const inventory = document.querySelector(".inventory-grid");
    for (let i = 0; i < amount; i++) {
        // Get a random item from our database
        let randomItem;
        do {
            randomItem = itemsDatabase[Math.floor(Math.random() * itemsDatabase.length)];
        } while (randomItem.name === except);
        const randomPercentage_bottom = Math.random() * (50 - 1) + 1;
        const randomPercentage_top = Math.random() * (100 - randomPercentage_bottom) + randomPercentage_bottom;
        const percentage = [randomPercentage_bottom.toFixed(0), randomPercentage_top.toFixed(0)];
        // Create item slot
        const itemSlot = document.createElement("div");
        itemSlot.className = "item-slot";
        itemSlot.dataset.itemId = i;
        itemSlot.dataset.itemName = randomItem.name;
        itemSlot.dataset.itemType = randomItem.type;
        itemSlot.dataset.percentage = percentage;
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
            percentageLabel.innerText = `${percentage[0]} - ${percentage[1]}`;
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
                        // Calculate percentage bonus properly (ensuring it's a number)
                        const [minStr, maxStr] = this.dataset.percentage.split(",");
                        const min = parseInt(minStr, 10);
                        const max = parseInt(maxStr, 10);
                        const randomPercentage = Math.floor(Math.random() * (max - min + 1)) + min;
                        // Only roll dice if this item has dice
                        if (this.dataset.itemDice) {
                            rollDice(this.dataset.itemDice, 1, randomPercentage);
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

        // Prevent right-click menu
        itemSlot.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });
        inventory.appendChild(itemSlot);
    }
}
// removeItemFromInventory
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
                    const [minStr, maxStr] = this.dataset.percentage.split(",");
                    const min = parseInt(minStr, 10);
                    const max = parseInt(maxStr, 10);
                    const randomPercentage = Math.floor(Math.random() * (max - min + 1)) + min;
                    // Only roll dice if this item has dice
                    if (this.dataset.itemDice) {
                        rollDice(this.dataset.itemDice, 1, randomPercentage);
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

function updateStatusBar(itemName, itemType, amount = null) {
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
            if (amount != null && amount > 0) {
                statusUpdate.innerText = `Used: ${itemName}, ${amount} items found`;
            } else {
                statusUpdate.innerText = `Used: ${itemName}`;
            }
            statusUpdate.style.color = 'blue';
    }
    // Animate status bar
    statusBar.style.backgroundColor = 'rgba(117, 121, 231, 0.4)';
    // Add status update to the bar
    statusBar.appendChild(statusUpdate);
    // Remove the status update after a few seconds
    setTimeout(() => {
        statusUpdate.remove();
        statusBar.style.backgroundColor = 'transparent';
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
    // Update button styles
    penBtn.classList.toggle('active', tool === 'pen');
    eraserBtn.classList.toggle('active', tool === 'eraser');
}

function keepInBounds() {
    const rect = notepad.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width;
    const maxTop = window.innerHeight - rect.height;

    let left = parseInt(notepad.style.left);
    let top = parseInt(notepad.style.top);

    left = Math.min(left, maxLeft);
    top = Math.min(top, maxTop);

    notepad.style.left = left + 'px';
    notepad.style.top = top + 'px';
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener('DOMContentLoaded', function () {
    notepad.addEventListener('mousedown', (e) => {
        if (!e.target.closest('h2')) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        const rect = notepad.getBoundingClientRect();
        notepadStartX = rect.left / 200;
        notepadStartY = rect.top / 200;

        notepad.style.left = notepadStartX + 'px';
        notepad.style.top = notepadStartY + 'px';

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        notepad.style.left = (notepadStartX + deltaX) + 'px';
        notepad.style.top = (notepadStartY + deltaY) + 'px';

        keepInBounds();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Drawing functionality
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        isDrawing = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = tool === 'pen' ? 'white' : '#222';
        ctx.lineWidth = tool === 'pen' ? 2 : 20;
        ctx.lineCap = 'round';
        ctx.stroke();

        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    canvas.addEventListener('mouseout', () => {
        isDrawing = false;
    });

    // Touch support for drawing
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
        isDrawing = true;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = tool === 'pen' ? 'white' : '#222';
        ctx.lineWidth = tool === 'pen' ? 2 : 20;
        ctx.lineCap = 'round';
        ctx.stroke();

        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('touchend', () => {
        isDrawing = false;
    });

    // Touch support for dragging
    notepad.addEventListener('touchstart', (e) => {
        if (!e.target.closest('h2')) return;
        isDragging = true;
        const touch = e.touches[0];
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;

        const rect = notepad.getBoundingClientRect();
        notepadStartX = rect.left;
        notepadStartY = rect.top;
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartX;
        const deltaY = touch.clientY - dragStartY;

        notepad.style.left = (notepadStartX + deltaX) + 'px';
        notepad.style.top = (notepadStartY + deltaY) + 'px';

        keepInBounds();

        if (isDrawing) e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    // Button event listeners
    penBtn.addEventListener('click', () => setTool('pen'));
    eraserBtn.addEventListener('click', () => setTool('eraser'));
    clearBtn.addEventListener('click', clearCanvas);
    // Initially position the notepad
    keepInBounds();
    // items, etc.
    generateItem(12);
    equippedInventoryGenerate(6);
});