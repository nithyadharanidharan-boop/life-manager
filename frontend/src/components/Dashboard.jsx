import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import HeroStats from './HeroStats.jsx';
import { TasksWidget, TasksPanel } from './TasksModule.jsx';
import { MoneyWidget, MoneyPanel } from './MoneyModule.jsx';
import { CalendarWidget, CalendarPanel } from './CalendarModule.jsx';
import { NotesWidget, NotesPanel } from './NotesModule.jsx';
import { AlarmsWidget, AlarmsPanel, getNextAlarm } from './AlarmsModule.jsx';
import AssistantDrawer, { AssistantFab } from './AssistantDrawer.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import {
  createSavingsEntry,
  createTask,
  deleteTask as apiDeleteTask,
  fetchSavings,
  fetchTasks,
  updateTask,
} from '../api.js';

const SEED_EVENTS = [
  { id: 1, title: 'Design review', date: new Date().toISOString().slice(0, 10), time: '15:00' },
];
const SEED_NOTES = [{ id: 1, title: 'Welcome to Nexus', body: 'This is your hub. Click any card to dive in.', color: 'violet' }];
const SEED_ALARMS = [{ id: 1, label: 'Wake up', time: '07:00', enabled: true, days: [1, 2, 3, 4, 5] }];

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useLocalStorage('nexus-notes', SEED_NOTES);
  const [alarms, setAlarms] = useLocalStorage('nexus-alarms', SEED_ALARMS);
  const [events, setEvents] = useLocalStorage('nexus-events', SEED_EVENTS);

  const [activePanel, setActivePanel] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data.tasks || []);
    } catch {
      // backend unreachable — leave list as-is
    }
  }, []);

  const loadSavings = useCallback(async () => {
    try {
      const data = await fetchSavings();
      setEntries(data.entries || []);
    } catch {
      // backend unreachable — leave list as-is
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadSavings();
  }, [loadTasks, loadSavings]);

  const handleCreateTask = async (form) => {
    const { task } = await createTask(form);
    setTasks((t) => [...t, task]);
  };
  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, status: nextStatus } : x)));
    try {
      await updateTask(task.id, { status: nextStatus });
    } catch {
      loadTasks();
    }
  };
  const handleDeleteTask = async (task) => {
    setTasks((t) => t.filter((x) => x.id !== task.id));
    try {
      await apiDeleteTask(task.id);
    } catch {
      loadTasks();
    }
  };

  const handleCreateEntry = async (form) => {
    const { entry } = await createSavingsEntry(form);
    setEntries((e) => [...e, entry]);
  };

  const addEvent = (form) => setEvents((e) => [...e, { id: Date.now(), ...form }]);
  const deleteEvent = (event) => setEvents((e) => e.filter((x) => x.id !== event.id));

  const addNote = (form) => setNotes((n) => [{ id: Date.now(), ...form }, ...n]);
  const deleteNote = (note) => setNotes((n) => n.filter((x) => x.id !== note.id));

  const addAlarm = (form) => setAlarms((a) => [...a, { id: Date.now(), ...form }]);
  const toggleAlarm = (alarm) => setAlarms((a) => a.map((x) => (x.id === alarm.id ? { ...x, enabled: !x.enabled } : x)));
  const deleteAlarm = (alarm) => setAlarms((a) => a.filter((x) => x.id !== alarm.id));

  const netSavings = useMemo(
    () => entries.reduce((s, e) => s + (e.type === 'income' ? Number(e.amount) : -Number(e.amount)), 0),
    [entries]
  );
  const nextAlarm = useMemo(() => getNextAlarm(alarms), [alarms]);
  const nextEvent = useMemo(
    () =>
      [...events]
        .filter((e) => new Date(`${e.date}T${e.time || '23:59'}`) >= new Date())
        .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))[0],
    [events]
  );

  const closePanel = () => setActivePanel(null);

  return (
    <div className="min-h-dvh">
      <Sidebar
        active={activePanel}
        onSelect={setActivePanel}
        onAssistant={() => setAssistantOpen(true)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-dvh flex-col lg:pl-[84px] xl:pl-[220px]">
        <Topbar
          user={user}
          tasks={tasks}
          notes={notes}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenPanel={setActivePanel}
          onLogout={onLogout}
        />

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HeroStats tasks={tasks} netSavings={netSavings} nextAlarm={nextAlarm} nextEvent={nextEvent} />
            <TasksWidget tasks={tasks} onToggle={handleToggleTask} onOpen={() => setActivePanel('tasks')} />
            <MoneyWidget entries={entries} onOpen={() => setActivePanel('money')} />
            <CalendarWidget events={events} onOpen={() => setActivePanel('calendar')} />
            <NotesWidget notes={notes} onOpen={() => setActivePanel('notes')} />
            <AlarmsWidget alarms={alarms} onToggle={toggleAlarm} onOpen={() => setActivePanel('alarms')} />
          </div>
        </main>
      </div>

      <TasksPanel
        open={activePanel === 'tasks'}
        onClose={closePanel}
        tasks={tasks}
        onCreate={handleCreateTask}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
      />
      <MoneyPanel open={activePanel === 'money'} onClose={closePanel} entries={entries} onCreate={handleCreateEntry} />
      <CalendarPanel open={activePanel === 'calendar'} onClose={closePanel} events={events} onCreate={addEvent} onDelete={deleteEvent} />
      <NotesPanel open={activePanel === 'notes'} onClose={closePanel} notes={notes} onCreate={addNote} onDelete={deleteNote} />
      <AlarmsPanel
        open={activePanel === 'alarms'}
        onClose={closePanel}
        alarms={alarms}
        onCreate={addAlarm}
        onToggle={toggleAlarm}
        onDelete={deleteAlarm}
      />

      <AssistantFab onClick={() => setAssistantOpen(true)} />
      <AssistantDrawer
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        tasks={tasks}
        entries={entries}
        alarms={alarms}
        events={events}
        notes={notes}
        user={user}
      />
    </div>
  );
}
