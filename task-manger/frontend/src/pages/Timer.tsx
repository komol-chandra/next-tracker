import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const Timer = () => {
  const { user, badges, setBadges, can, refreshBadges } = useAuth();
  const [timer, setTimer] = useState<any>({
    running: false,
    accumulatedSeconds: 0,
    task: null,
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskId, setTaskId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    apiClient.get("/time/timer").then((resp) => {
      const data = resp.data.data;
      setTimer({
        running: !!data.running,
        accumulatedSeconds: data.accumulatedSeconds || 0,
        task: data.task || null,
      });
    });

    apiClient.get("/tasks?scope=mine").then((resp) => {
      setTasks(resp.data.data);
    });
  }, [user]);

  const startTimer = async () => {
    if (!taskId || !can("timelog.record")) return;
    await apiClient.post("/time/timer/start", { taskId });
    setTimer({ running: true, accumulatedSeconds: 0, task: taskId });
    refreshBadges();
  };

  const pauseTimer = async () => {
    await apiClient.post("/time/timer/pause");
    setTimer((prev: any) => ({ ...prev, running: false }));
    refreshBadges();
  };

  const resumeTimer = async () => {
    await apiClient.post("/time/timer/resume");
    setTimer((prev: any) => ({ ...prev, running: true }));
  };

  const stopTimer = async () => {
    await apiClient.post("/time/timer/stop", { notes: "" });
    setTimer({ running: false, accumulatedSeconds: 0, task: null });
    setIsSubmitted(true);
    setBadges({ ...badges, timer: { running: false, startedAt: null, accumulatedSeconds: 0 } });
    refreshBadges();
  };

  const elapsed = (() => {
    const total = timer.accumulatedSeconds || 0;
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  })();

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">Time Tracker</h1>
      {can("timelog.record") ? (
        <div className="bg-white p-4 rounded shadow-sm mb-6 max-w-xl">
          <h2 className="font-medium mb-2">Start Timer</h2>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4"
          >
            <option value="">Select a task</option>
            {tasks.map((t) => (
              <option key={t.id || t._id} value={t.id || t._id}>
                {t.title}
              </option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={startTimer}
            disabled={!taskId || timer.running}
          >
            Start
          </button>
        </div>
      ) : (
        <p className="text-red-500">You don't have permission to start the timer</p>
      )}

      {(timer.running || (timer.accumulatedSeconds > 0 && timer.task)) && (
        <div className="bg-white p-4 rounded shadow-sm mb-6 max-w-xl">
          <h2 className="font-medium">{timer.running ? "Running Timer" : "Paused Timer"}</h2>
          <p className="text-3xl font-bold tabular-nums">{elapsed}</p>
          <div className="flex gap-4 mt-4">
            {timer.running ? (
              <button onClick={pauseTimer} className="flex-1 bg-yellow-400 px-4 py-2 rounded">
                Pause
              </button>
            ) : (
              <button onClick={resumeTimer} className="flex-1 bg-green-500 text-white px-4 py-2 rounded">
                Resume
              </button>
            )}
            <button onClick={stopTimer} className="flex-1 bg-red-500 text-white px-4 py-2 rounded">
              Stop
            </button>
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className="bg-green-100 p-4 rounded mb-6 text-green-800">
          <strong>Time entry recorded!</strong>
        </div>
      )}
    </div>
  );
};

export default Timer;
