const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const winnerValue = document.getElementById('winnerValue');
const board = document.querySelector('.board');
const percentage_increase = Math.random() * (1 - 0.1) + 0.1;
let activePiece = null;
let isSpinning = false;
const ruleTracker = {};
const rollTracker = {};
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

function showForm(formId) {
    document.getElementById(formId).style.opacity = 1;
    document.getElementById(formId).style.display = 'block';

}

function closeForm(formId) {
    document.getElementById(formId).style.opacity = 0;
    document.getElementById(formId).style.display = 'none';
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
            button.innerText = `${percentage_increase.toFixed(2)}% chance - ${ruleName}`;
        }

        button.title = description;
        document.querySelector(".content").appendChild(button);
        // Store button and current percentage
        ruleTracker[ruleName] = {
            button: button,
            percentage: percentage_increase
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

function addRoll(type, number) {
    let button = document.createElement("button");
    button.classList.add("track");
    button.innerText = type + ": " + number;
    document.querySelector(".content").appendChild(button);
    var uniqid = Date.now();
    rollTracker[uniqid] = {
        button: button
    };
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

function rollDice(dice_type, amount) {
    var endvalue = 0;
    if (amount != null) {
        for (i = 0; i < amount; i++) {
            if (dice_type == "1d4") {
                endvalue = 4;
            } else if (dice_type == "1d6") {
                endvalue = 6;
            } else if (dice_type == "1d8") {
                endvalue = 8;
            } else if (dice_type == "1d10") {
                endvalue = 10;
            } else if (dice_type == "1d12") {
                endvalue = 12;
            } else if (dice_type == "1d20") {
                endvalue = 20;
            } else if (dice_type == "1d100") {
                endvalue = 100;
            } else {
                return null;
            }
        }
    }
    let rollValue = Math.floor(1 + Math.random() * endvalue);
    addRoll(dice_type, rollValue);
}

function percentage() {
    // Format to 2 decimal places and update the label
    document.getElementById('percentage-label').innerText = percentage_increase.toFixed(2) + '%';
}

function generateItem(amount) {
    for (i=onabort; i<amount; i++) {
        const inventory = document.querySelector(".inventory-grid");

        const items = [
            { icon: "fa-gavel", name: "Warhammer", dice: "1d8" },
            { icon: "fa-key", name: "Skeleton Key" },
            { icon: "fa-legal", name: "Hammer", dice: "1d12" },
            { icon: "fa-medkit", name: "Medkit", dice: "1d6" },
            { icon: "fa-flask", name: "Potion", dice: "1d6" },
            { icon: "fa-ring", name: "Ring of Power" },
            { icon: "fa-shoe-prints", name: "Boots of Speed" },
            { icon: "fa-book", name: "Spell Book", dice: "1d100" },
            { icon: "fa-map", name: "Ancient Map" },
            { icon: "fa-suitcase", name: "Adventurer’s Pack" },
            { icon: "fa-shield-alt", name: "Shield", dice: "1d10" },
            { icon: "fa-bomb", name: "Grenade", dice: "1d20" },
            { icon: "fa-feather", name: "Phoenix Feather" },
            { icon: "fa-skull", name: "Cursed Totem", dice: "1d4" }
        ];

        const randomItem = items[Math.floor(Math.random() * items.length)];

        const itemSlot = document.createElement("div");
        itemSlot.className = "item-slot";
        itemSlot.title = randomItem.name;

        const icon = document.createElement("i");
        icon.className = "fas " + randomItem.icon;

        if (randomItem.dice) {
            itemSlot.onclick = () => rollDice(randomItem.dice, 1);
            const label = document.createElement("label");
            label.innerText = randomItem.dice;
            itemSlot.appendChild(icon);
            itemSlot.appendChild(label);
        } else {
            itemSlot.appendChild(icon);
        }

        inventory.appendChild(itemSlot);
    }
}

spinBtn.addEventListener('click', rotateWheel);
addRule('Rule 1', 'Every time the wheel spins, a new rule must be added.');
addRule('Rule 2', 'No rules can be removed or changed during play.');
addRule('Rule 3', 'Rules can stack over time, thus changing the chance of that rule being applied.');
percentage();
generateItem(10);