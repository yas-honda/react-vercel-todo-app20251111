
import React, { useState, useEffect, useCallback, FormEvent } from 'react';

interface Task {
  id: number;
  text: string;
  created_at: string;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/getTasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.tasks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch('/api/addTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTaskText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }

      setNewTaskText('');
      await getTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-cyan-400">ToDo List</h1>
        <p className="text-center text-gray-400">Powered by Vercel & React</p>

        <form onSubmit={handleAddTask} className="flex gap-4">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition transform hover:scale-105"
          >
            Add
          </button>
        </form>

        <div className="space-y-4">
          {loading && <p className="text-center text-gray-400">Loading tasks...</p>}
          {error && <p className="text-center text-red-400">Error: {error}</p>}
          {!loading && !error && (
             <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg shadow"
                  >
                    <span className="text-lg">{task.text}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No tasks yet. Add one above!</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
