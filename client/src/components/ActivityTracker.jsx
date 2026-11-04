import { useState } from "react";

function ActivityTracker() {

  const [activities, setActivities] = useState([
    "Welcome Event",
    "Programming Workshop"
  ]);

  const [newActivity, setNewActivity] = useState("");

  function addActivity() {

    if (newActivity.trim() === "") {
      return;
    }

    setActivities([
      ...activities,
      newActivity
    ]);

    setNewActivity("");
  }

  function removeActivity(index) {

    const updatedActivities = activities.filter(
      (_, i) => i !== index
    );

    setActivities(updatedActivities);
  }

  return (
    <section className="activity-section">

      <h2>Campus Activity Tracker</h2>

      <p>
        Add or remove campus activities using React state.
      </p>

      <div className="activity-input">

        <input
          type="text"
          placeholder="Enter a campus activity"
          value={newActivity}
          onChange={(event) =>
            setNewActivity(event.target.value)
          }
        />

        <button onClick={addActivity}>
          Add Activity
        </button>

      </div>

      <ul className="activity-list">

        {activities.map((activity, index) => (

          <li key={index}>

            <span>{activity}</span>

            <button
              onClick={() => removeActivity(index)}
            >
              Remove
            </button>

          </li>

        ))}

      </ul>

      <p className="activity-count">
        Total Activities: {activities.length}
      </p>

    </section>
  );
}

export default ActivityTracker;