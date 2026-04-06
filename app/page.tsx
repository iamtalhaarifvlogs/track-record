"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type SectionType = "Task" | "Project" | "Client" | "Note";
type StatusType = "Pending" | "In Progress" | "Completed" | "On Hold";

type ClientItem = {
  id: string;
  type: "Client";
  name: string;
  country: string;
  status: StatusType;
  createdAt: string;
  deadline?: string;
  details: string;
};

type ProjectItem = {
  id: string;
  type: "Project";
  title: string;
  clientId: string;
  clientName: string;
  status: StatusType;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  deadline?: string;
  details: string;
};

type TaskItem = {
  id: string;
  type: "Task";
  title: string;
  projectId: string;
  projectTitle: string;
  status: StatusType;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  deadline?: string;
  details: string;
};

type NoteItem = {
  id: string;
  type: "Note";
  title: string;
  createdAt: string;
  details: string;
};

type AnyItem = ClientItem | ProjectItem | TaskItem | NoteItem;

const STORAGE_KEY = "talha-diary-data-v2";

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 99999)}`;
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function StatusBadge({ status }: { status: StatusType }) {
  const styles =
    status === "Completed"
      ? "bg-green-100 text-green-800 border-green-200"
      : status === "In Progress"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "Low" | "Medium" | "High" }) {
  const styles =
    priority === "High"
      ? "bg-red-100 text-red-800 border-red-200"
      : priority === "Medium"
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}
    >
      {priority}
    </span>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 px-4 py-10 overflow-y-auto flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 text-white">
          <h3 className="text-lg md:text-xl font-extrabold">{title}</h3>
          <button
            onClick={onClose}
            className="bg-white text-cyan-900 font-bold px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto text-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrev,
}: {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-6">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-5 py-2 rounded-xl bg-cyan-900 text-white font-semibold shadow hover:bg-cyan-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      <p className="text-gray-700 font-medium text-sm">
        Page <span className="font-bold">{currentPage}</span> of{" "}
        <span className="font-bold">{totalPages}</span>
      </p>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="px-5 py-2 rounded-xl bg-cyan-900 text-white font-semibold shadow hover:bg-cyan-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

export default function Page() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  const [taskPage, setTaskPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [notePage, setNotePage] = useState(1);
  const itemsPerPage = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "details">(
    "add"
  );
  const [selectedType, setSelectedType] = useState<SectionType>("Task");
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formStatus, setFormStatus] = useState<StatusType>("Pending");
  const [formPriority, setFormPriority] = useState<"Low" | "Medium" | "High">(
    "Medium"
  );
  const [formDeadline, setFormDeadline] = useState("");

  const [formClientName, setFormClientName] = useState("");
  const [formClientCountry, setFormClientCountry] = useState("");

  const [formSelectedClientId, setFormSelectedClientId] = useState("");
  const [formSelectedProjectId, setFormSelectedProjectId] = useState("");

  // Load storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setTasks(parsed.tasks || []);
      setProjects(parsed.projects || []);
      setClients(parsed.clients || []);
      setNotes(parsed.notes || []);
    }
  }, []);

  // Save storage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasks, projects, clients, notes })
    );
  }, [tasks, projects, clients, notes]);

  function resetForm() {
    setFormTitle("");
    setFormDetails("");
    setFormStatus("Pending");
    setFormPriority("Medium");
    setFormDeadline("");
    setFormClientName("");
    setFormClientCountry("");
    setFormSelectedClientId("");
    setFormSelectedProjectId("");
  }

  function openAddModal() {
    resetForm();
    setSelectedItem(null);
    setModalMode("add");
    setSelectedType("Task");
    setModalOpen(true);
  }

  function openDetailsModal(item: AnyItem) {
    setSelectedItem(item);
    setModalMode("details");
    setModalOpen(true);
  }

  function openEditModal(item: AnyItem) {
    resetForm();
    setSelectedItem(item);
    setModalMode("edit");
    setModalOpen(true);

    if (item.type === "Task") {
      setSelectedType("Task");
      setFormTitle(item.title);
      setFormDetails(item.details);
      setFormStatus(item.status);
      setFormPriority(item.priority);
      setFormDeadline(item.deadline || "");
      setFormSelectedProjectId(item.projectId);
    } else if (item.type === "Project") {
      setSelectedType("Project");
      setFormTitle(item.title);
      setFormDetails(item.details);
      setFormStatus(item.status);
      setFormPriority(item.priority);
      setFormDeadline(item.deadline || "");
      setFormSelectedClientId(item.clientId);
    } else if (item.type === "Client") {
      setSelectedType("Client");
      setFormClientName(item.name);
      setFormClientCountry(item.country);
      setFormDetails(item.details);
      setFormStatus(item.status);
      setFormDeadline(item.deadline || "");
    } else if (item.type === "Note") {
      setSelectedType("Note");
      setFormTitle(item.title);
      setFormDetails(item.details);
    }
  }

  function deleteItem(item: AnyItem) {
    const confirmDelete = confirm(`Are you sure you want to delete this ${item.type}?`);
    if (!confirmDelete) return;

    if (item.type === "Client") {
      const projectIds = projects.filter((p) => p.clientId === item.id).map((p) => p.id);
      setClients((prev) => prev.filter((x) => x.id !== item.id));
      setProjects((prev) => prev.filter((p) => p.clientId !== item.id));
      setTasks((prev) => prev.filter((t) => !projectIds.includes(t.projectId)));
    } else if (item.type === "Project") {
      setProjects((prev) => prev.filter((x) => x.id !== item.id));
      setTasks((prev) => prev.filter((t) => t.projectId !== item.id));
    } else if (item.type === "Task") {
      setTasks((prev) => prev.filter((x) => x.id !== item.id));
    } else if (item.type === "Note") {
      setNotes((prev) => prev.filter((x) => x.id !== item.id));
    }
  }

  // Pagination helper
  function paginate<T>(items: T[], page: number) {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }

  const paginatedTasks = useMemo(() => paginate(tasks, taskPage), [tasks, taskPage]);
  const paginatedProjects = useMemo(() => paginate(projects, projectPage), [projects, projectPage]);
  const paginatedClients = useMemo(() => paginate(clients, clientPage), [clients, clientPage]);
  const paginatedNotes = useMemo(() => paginate(notes, notePage), [notes, notePage]);

  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / itemsPerPage));
  const totalProjectPages = Math.max(1, Math.ceil(projects.length / itemsPerPage));
  const totalClientPages = Math.max(1, Math.ceil(clients.length / itemsPerPage));
  const totalNotePages = Math.max(1, Math.ceil(notes.length / itemsPerPage));

  return (
    <>
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-6xl space-y-20">
        {/* HERO */}
        <section className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 px-8 py-10 text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold">
              Talha&apos;s Diary Dashboard
            </h1>

            <p className="text-cyan-100 mt-3 max-w-3xl leading-relaxed">
              Track your tasks, projects, clients, and notes. Everything is saved automatically on your device.
            </p>

            <div className="mt-7">
              <button
                onClick={openAddModal}
                className="bg-white text-cyan-900 font-bold px-7 py-3 rounded-2xl shadow-lg hover:bg-gray-100 transition"
              >
                + Add New Entry
              </button>
            </div>
          </div>

          <div className="px-8 py-6 text-gray-700 text-sm md:text-base">
            <p>
              <span className="font-bold text-cyan-900">Tip:</span> Use the header menu to jump between sections instantly.
            </p>
          </div>
        </section>

        {/* TASKS */}
        <section id="tasks" className="scroll-mt-32">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-3xl font-extrabold text-cyan-900">Tasks</h2>
            <p className="text-gray-600 font-medium">
              Total: <span className="font-bold">{tasks.length}</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Task</th>
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                    <th className="px-6 py-4 font-bold">Deadline</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTasks.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-gray-600" colSpan={6}>
                        No tasks yet. Add your first task.
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((task) => (
                      <tr key={task.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-6 py-5 font-semibold text-gray-900">{task.title}</td>
                        <td className="px-6 py-5 text-gray-700 font-medium">{task.projectTitle}</td>
                        <td className="px-6 py-5"><StatusBadge status={task.status} /></td>
                        <td className="px-6 py-5"><PriorityBadge priority={task.priority} /></td>
                        <td className="px-6 py-5">{task.deadline || "—"}</td>
                        <td className="px-6 py-5 text-right space-x-3">
                          <button
                            onClick={() => openDetailsModal(task)}
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-orange-600 font-semibold hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(task)}
                            className="text-red-600 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={taskPage}
              totalPages={totalTaskPages}
              onNext={() => setTaskPage((p) => Math.min(p + 1, totalTaskPages))}
              onPrev={() => setTaskPage((p) => Math.max(p - 1, 1))}
            />
          </div>
        </section>

        {/* Add Footer */}
        <Footer />
      </main>

      <Modal open={modalOpen} title={modalMode === "add" ? "Add Entry" : modalMode === "edit" ? "Edit Entry" : "Entry Details"} onClose={() => setModalOpen(false)}>
        {/* Modal content will go here */}
      </Modal>
    </>
  );
}