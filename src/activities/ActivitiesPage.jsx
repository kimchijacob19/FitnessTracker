import { useAuth } from "../auth/AuthContext";
import useQuery from "../api/useQuery";
import useMutation from "../api/useMutation";
import { useState } from "react";

export default function ActivitiesPage() {
  const { token } = useAuth();

  const {
    data: activities,
    loading,
    error,
  } = useQuery("/activities", "activities");

  const {
    mutate: deleteActivity,
    loading: deleting,
    error: deleteError,
  } = useMutation("DELETE", "/activities", ["activities"]);

  const {
    mutate: createActivity,
    loading: creating,
    error: createError,
  } = useMutation("POST", "/activities", ["activities"]);

  const [formError, setFormError] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteActivity({ id });
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const description = formData.get("description");

    if (!name || !description) {
      setFormError("Both fields are required.");
      return;
    }

    try {
      await createActivity({ name, description });
      e.target.reset();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <>
      <h1>Activities</h1>

      {loading && <p>Loading activities...</p>}
      {error && <p>Error: {error}</p>}

      {activities ? (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>
              <strong>{activity.name}</strong>: {activity.description}
              {token && (
                <button
                  onClick={() => handleDelete(activity.id)}
                  disabled={deleting}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No activities available.</p>
      )}

      {deleteError && (
        <p style={{ color: "red" }}>Delete error: {deleteError}</p>
      )}

      {token && (
        <>
          <h2>Create a New Activity</h2>
          <form onSubmit={handleCreate}>
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Description
              <input name="description" required />
            </label>
            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Activity"}
            </button>
            {formError && <output>{formError}</output>}
            {createError && (
              <p style={{ color: "red" }}>
                Error creating activity: {createError}
              </p>
            )}
          </form>
        </>
      )}
    </>
  );
}
