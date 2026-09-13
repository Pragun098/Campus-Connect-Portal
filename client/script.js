// Campus Connect - Experiment 4
// State Handling and Version Control

const welcomeBtn = document.getElementById("welcomeBtn");
const welcomeMessage = document.getElementById("welcomeMessage");

const studentName = document.getElementById("studentName");
const nameOutput = document.getElementById("nameOutput");

const activityInput = document.getElementById("activityInput");
const activityList = document.getElementById("activityList");
const addActivityBtn = document.getElementById("addActivityBtn");
const keyMessage = document.getElementById("keyMessage");

// Application state
let activities = [
    "Welcome Event",
    "Programming Workshop"
];

// Welcome button
welcomeBtn.addEventListener("click", function () {
    welcomeMessage.textContent =
        "Welcome! We are happy to have you on Campus Connect.";
});

// Name input
studentName.addEventListener("input", function () {
    if (studentName.value.trim() === "") {
        nameOutput.textContent = "Your name will appear here.";
    } else {
        nameOutput.textContent =
            "Hello, " + studentName.value + "!";
    }
});

// Display activities from state
function renderActivities() {

    activityList.innerHTML = "";

    activities.forEach(function (activity, index) {

        const newItem = document.createElement("li");

        const activityName = document.createElement("span");
        activityName.textContent = activity;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-btn";

        removeButton.addEventListener("click", function () {
            activities.splice(index, 1);

            renderActivities();

            keyMessage.textContent =
                "Activity removed successfully.";
        });

        newItem.appendChild(activityName);
        newItem.appendChild(removeButton);

        activityList.appendChild(newItem);
    });
}

// Add activity
function addActivity() {

    const activityText = activityInput.value.trim();

    if (activityText === "") {
        keyMessage.textContent =
            "Please enter an activity first.";
        return;
    }

    // Update application state
    activities.push(activityText);

    // Update the interface
    renderActivities();

    activityInput.value = "";

    keyMessage.textContent =
        "Activity added successfully.";
}

// Add button event
addActivityBtn.addEventListener("click", addActivity);

// Enter key event
activityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        addActivity();
    }
});

// Display initial state
renderActivities();