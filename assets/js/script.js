const ruleTracker = {};
const rollStoryTracker = {};
const percentageIncrease = Math.random() * 0.9 + 0.1;
const container = document.getElementById("content");

function closeHeader() {
    document.getElementById("header").style.opacity = 0;
    document.getElementById("header").style.display = 'none';
}

function clearForms() {
    const container = document.getElementById("login-container");
    container.innerHTML = "";
    const line = document.createElement("div");
    line.className = "line";
    const loginButton = document.createElement("button");
    loginButton.type = "button";
    loginButton.textContent = "Login";
    loginButton.onclick = login;
    const createButton = document.createElement("button");
    createButton.type = "button";
    createButton.textContent = "Create";
    createButton.onclick = create;
    line.appendChild(loginButton);
    line.appendChild(createButton);
    container.appendChild(line);
}

function login() {
    clearForms();
    const container = document.getElementById("login-container");
    const title = document.createElement("h2");
    title.textContent = "Login Form";
    container.appendChild(title);
    // Username
    const usernameLabel = document.createElement("label");
    usernameLabel.htmlFor = "username";
    usernameLabel.textContent = "Username";
    container.appendChild(usernameLabel);
    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.id = "username";
    usernameInput.name = "username";
    usernameInput.placeholder = "Enter your username";
    usernameInput.required = true;
    usernameInput.setAttribute("aria-label", "Username");
    container.appendChild(usernameInput);
    // Password
    const passwordLabel = document.createElement("label");
    passwordLabel.htmlFor = "password";
    passwordLabel.textContent = "Password";
    container.appendChild(passwordLabel);
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.name = "password";
    passwordInput.placeholder = "Enter your password";
    passwordInput.required = true;
    passwordInput.setAttribute("aria-label", "Password");
    container.appendChild(passwordInput);
    // Forgot Password link
    const forgotLink = document.createElement("a");
    forgotLink.href = "#";
    forgotLink.textContent = " Forgot Password?";
    forgotLink.style.color = "lightblue";
    forgotLink.setAttribute("aria-label", "Forgot Password");
    container.appendChild(forgotLink);
    // Submit Button
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Submit";
    container.appendChild(submitButton);
}

function create() {
    clearForms();
    const container = document.getElementById("login-container");
    const title = document.createElement("h2");
    title.textContent = "Create Account";
    container.appendChild(title);
    // Username
    const usernameLabel = document.createElement("label");
    usernameLabel.htmlFor = "username";
    usernameLabel.textContent = "Username";
    container.appendChild(usernameLabel);
    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.id = "username";
    usernameInput.name = "username";
    usernameInput.placeholder = "Enter your username";
    usernameInput.required = true;
    usernameInput.setAttribute("aria-label", "Username");
    container.appendChild(usernameInput);
    // email
    const emailLabel = document.createElement("label");
    emailLabel.htmlFor = "email";
    emailLabel.textContent = "Email";
    container.appendChild(emailLabel);
    const emailInput = document.createElement("input");
    emailInput.type = "text";
    emailInput.id = "email";
    emailInput.name = "email";
    emailInput.placeholder = "Enter your email";
    emailInput.required = true;
    emailInput.setAttribute("aria-label", "Email");
    container.appendChild(emailInput);
    // password
    const passwordLabel = document.createElement("label");
    passwordLabel.htmlFor = "password";
    passwordLabel.textContent = "Password";
    container.appendChild(passwordLabel);
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.name = "password";
    passwordInput.placeholder = "Enter your password";
    passwordInput.required = true;
    passwordInput.setAttribute("aria-label", "Password");
    container.appendChild(passwordInput);
    // Submit Button
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Create";
    container.appendChild(submitButton);
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
    scrollToBottom();
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
        rollStoryTracker[uniqid] = { button: totalButton };
    }
    scrollToBottom();
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
    rollStoryTracker[uniqid] = { button: button };
    scrollToBottom();
}

function addAction(name, type, dice_type = null) {
    let story = "";
    let amount = null;
    // Specific handling for different item types
    if (!dice_type) {
        switch (name) {
            case "Skeleton Key":
                story = "You use a Skeleton Key.";
                removeItemFromInventory(name);
                break;
            case "Ring of Power":
                story = "You feel a surge of strength.";
                removeItemFromInventory(name);
                break;
            case "Boots of Speed":
                story = "You dash forward with incredible speed.";
                removeItemFromInventory(name);
                break;
            case "Ancient Map":
                story = "You found a new area, one map used.";
                removeItemFromInventory(name);
                break;
            case "Adventurer's Pack":
                story = "You have found some useful supplies.";
                amount = Math.random() * 10 + 1;
                generateItem(amount, "Adventurer's Pack");
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
        rollStoryTracker[uniqid] = { button: button };
    }
    // Update status bar
    updateStatusBar(name, type, amount.toFixed(0));
    scrollToBottom();
    return story;
}

function scrollToBottom() {
    container.scrollTop = container.scrollHeight;
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

document.addEventListener('DOMContentLoaded', function () {
    addRule('Rule 1', 'Every time the wheel spins, a new rule must be added.');
    addRule('Rule 2', 'No rules can be removed or changed during play.');
    addRule('Rule 3', 'Rules can stack over time, thus changing the chance of that rule being applied.');
});