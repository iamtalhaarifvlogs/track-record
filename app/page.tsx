"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type SectionType = "Task" | "Project" | "Client" | "Note";
type StatusType = "Pending" | "In Progress" | "Completed" | "On Hold";

type TaskProjectItem = {
  id: string;
  type: "Task" | "Project";
  title: string;
  status: StatusType;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  deadline?: string;
  details: string;
};

type ClientItem = {
  id: string;
  type: "Client";
  name: string;
  project: string;
  country: string;
  status: StatusType;
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

type AnyItem = TaskProjectItem | ClientItem | NoteItem;

const STORAGE_KEY = "talha-diary-data-v1";

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

function PriorityBadge({
  priority,
}: {
  priority: "Low" | "Medium" | "High";
}) {
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
    <div className="fixed inset-0 z-50 bg-black/60 px-4 py-8 overflow-y-auto flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 text-white">
          <h3 className="text-lg md:text-xl font-extrabold">{title}</h3>

          <button
            onClick={onClose}
            className="bg-white text-cyan-900 font-bold px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
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
  const [tasks, setTasks] = useState<TaskProjectItem[]>([]);
  const [projects, setProjects] = useState<TaskProjectItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Pagination
  const [taskPage, setTaskPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [notePage, setNotePage] = useState(1);

  const itemsPerPage = 5;

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "details">("add");
  const [selectedType, setSelectedType] = useState<SectionType>("Task");
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);

  // Form States
  const [formTitle, setFormTitle] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formStatus, setFormStatus] = useState<StatusType>("Pending");
  const [formPriority, setFormPriority] = useState<"Low" | "Medium" | "High">(
    "Medium"
  );
  const [formDeadline, setFormDeadline] = useState("");

  const [formClientName, setFormClientName] = useState("");
  const [formClientProject, setFormClientProject] = useState("");
  const [formClientCountry, setFormClientCountry] = useState("");

  // Load from localStorage
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

  // Save to localStorage
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
    setFormClientProject("");
    setFormClientCountry("");
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

    if (item.type === "Task" || item.type === "Project") {
      setSelectedType(item.type);
      setFormTitle(item.title);
      setFormDetails(item.details);
      setFormStatus(item.status);
      setFormPriority(item.priority);
      setFormDeadline(item.deadline || "");
    }

    if (item.type === "Client") {
      setSelectedType("Client");
      setFormClientName(item.name);
      setFormClientProject(item.project);
      setFormClientCountry(item.country);
      setFormDetails(item.details);
      setFormStatus(item.status);
      setFormDeadline(item.deadline || "");
    }

    if (item.type === "Note") {
      setSelectedType("Note");
      setFormTitle(item.title);
      setFormDetails(item.details);
    }
  }

  function deleteItem(item: AnyItem) {
    const confirmDelete = confirm(
      `Are you sure you want to delete this ${item.type}?`
    );

    if (!confirmDelete) return;

    if (item.type === "Task") setTasks((prev) => prev.filter((x) => x.id !== item.id));
    if (item.type === "Project")
      setProjects((prev) => prev.filter((x) => x.id !== item.id));
    if (item.type === "Client")
      setClients((prev) => prev.filter((x) => x.id !== item.id));
    if (item.type === "Note") setNotes((prev) => prev.filter((x) => x.id !== item.id));
  }

  function handleSave() {
    // ADD
    if (modalMode === "add") {
      if (selectedType === "Task" || selectedType === "Project") {
        if (!formTitle.trim()) return alert("Title is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const newItem: TaskProjectItem = {
          id: generateId(),
          type: selectedType,
          title: formTitle,
          details: formDetails,
          status: formStatus,
          priority: formPriority,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
        };

        if (selectedType === "Task") setTasks((prev) => [newItem, ...prev]);
        if (selectedType === "Project") setProjects((prev) => [newItem, ...prev]);

        setModalOpen(false);
        resetForm();
        return;
      }

      if (selectedType === "Client") {
        if (!formClientName.trim()) return alert("Client name is required.");
        if (!formClientProject.trim()) return alert("Project is required.");
        if (!formClientCountry.trim()) return alert("Country is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const newClient: ClientItem = {
          id: generateId(),
          type: "Client",
          name: formClientName,
          project: formClientProject,
          country: formClientCountry,
          status: formStatus,
          details: formDetails,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
        };

        setClients((prev) => [newClient, ...prev]);
        setModalOpen(false);
        resetForm();
        return;
      }

      if (selectedType === "Note") {
        if (!formTitle.trim()) return alert("Note title is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const newNote: NoteItem = {
          id: generateId(),
          type: "Note",
          title: formTitle,
          details: formDetails,
          createdAt: formatDate(new Date()),
        };

        setNotes((prev) => [newNote, ...prev]);
        setModalOpen(false);
        resetForm();
        return;
      }
    }

    // EDIT
    if (modalMode === "edit" && selectedItem) {
      if (selectedItem.type === "Task" || selectedItem.type === "Project") {
        if (!formTitle.trim()) return alert("Title is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const updated: TaskProjectItem = {
          ...selectedItem,
          title: formTitle,
          details: formDetails,
          status: formStatus,
          priority: formPriority,
          deadline: formDeadline || undefined,
        };

        if (selectedItem.type === "Task") {
          setTasks((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        }

        if (selectedItem.type === "Project") {
          setProjects((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        }

        setModalOpen(false);
        resetForm();
        return;
      }

      if (selectedItem.type === "Client") {
        if (!formClientName.trim()) return alert("Client name is required.");
        if (!formClientProject.trim()) return alert("Project is required.");
        if (!formClientCountry.trim()) return alert("Country is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const updated: ClientItem = {
          ...selectedItem,
          name: formClientName,
          project: formClientProject,
          country: formClientCountry,
          status: formStatus,
          details: formDetails,
          deadline: formDeadline || undefined,
        };

        setClients((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));

        setModalOpen(false);
        resetForm();
        return;
      }

      if (selectedItem.type === "Note") {
        if (!formTitle.trim()) return alert("Title is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const updated: NoteItem = {
          ...selectedItem,
          title: formTitle,
          details: formDetails,
        };

        setNotes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));

        setModalOpen(false);
        resetForm();
        return;
      }
    }
  }

  // Pagination helper
  function paginate<T>(items: T[], page: number) {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }

  const paginatedTasks = useMemo(() => paginate(tasks, taskPage), [tasks, taskPage]);
  const paginatedProjects = useMemo(
    () => paginate(projects, projectPage),
    [projects, projectPage]
  );
  const paginatedClients = useMemo(
    () => paginate(clients, clientPage),
    [clients, clientPage]
  );
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
              Track your tasks, clients, projects and notes. Everything saves automatically
              on your device.
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
              <span className="font-bold text-cyan-900">Tip:</span> Use the header menu
              to jump between sections instantly.
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
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                    <th className="px-6 py-4 font-bold">Deadline</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTasks.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-gray-600" colSpan={5}>
                        No tasks yet. Add your first task.
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((task) => (
                      <tr key={task.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {task.title}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={task.status} />
                        </td>

                        <td className="px-6 py-5">
                          <PriorityBadge priority={task.priority} />
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {task.deadline || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => openDetailsModal(task)}
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => openEditModal(task)}
                              className="px-4 py-2 rounded-xl bg-cyan-900 text-white font-semibold hover:bg-cyan-800 transition"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteItem(task)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6">
              <Pagination
                currentPage={taskPage}
                totalPages={totalTaskPages}
                onPrev={() => setTaskPage((p) => Math.max(1, p - 1))}
                onNext={() => setTaskPage((p) => Math.min(totalTaskPages, p + 1))}
              />
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="scroll-mt-32">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-3xl font-extrabold text-cyan-900">Projects</h2>
            <p className="text-gray-600 font-medium">
              Total: <span className="font-bold">{projects.length}</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                    <th className="px-6 py-4 font-bold">Deadline</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProjects.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-gray-600" colSpan={5}>
                        No projects yet. Add your first project.
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {project.title}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={project.status} />
                        </td>

                        <td className="px-6 py-5">
                          <PriorityBadge priority={project.priority} />
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {project.deadline || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => openDetailsModal(project)}
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => openEditModal(project)}
                              className="px-4 py-2 rounded-xl bg-cyan-900 text-white font-semibold hover:bg-cyan-800 transition"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteItem(project)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6">
              <Pagination
                currentPage={projectPage}
                totalPages={totalProjectPages}
                onPrev={() => setProjectPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setProjectPage((p) => Math.min(totalProjectPages, p + 1))
                }
              />
            </div>
          </div>
        </section>

        {/* CLIENTS */}
        <section id="clients" className="scroll-mt-32">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-3xl font-extrabold text-cyan-900">Clients</h2>
            <p className="text-gray-600 font-medium">
              Total: <span className="font-bold">{clients.length}</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold">Country</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedClients.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-gray-600" colSpan={5}>
                        No clients yet. Add your first client.
                      </td>
                    </tr>
                  ) : (
                    paginatedClients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {client.name}
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {client.project}
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {client.country}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={client.status} />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => openDetailsModal(client)}
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => openEditModal(client)}
                              className="px-4 py-2 rounded-xl bg-cyan-900 text-white font-semibold hover:bg-cyan-800 transition"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteItem(client)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6">
              <Pagination
                currentPage={clientPage}
                totalPages={totalClientPages}
                onPrev={() => setClientPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setClientPage((p) => Math.min(totalClientPages, p + 1))
                }
              />
            </div>
          </div>
        </section>

        {/* NOTES */}
        <section id="notes" className="scroll-mt-32">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-3xl font-extrabold text-cyan-900">Notes</h2>
            <p className="text-gray-600 font-medium">
              Total: <span className="font-bold">{notes.length}</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Created</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedNotes.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-gray-600" colSpan={3}>
                        No notes yet. Add your first note.
                      </td>
                    </tr>
                  ) : (
                    paginatedNotes.map((note) => (
                      <tr
                        key={note.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {note.title}
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {note.createdAt}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => openDetailsModal(note)}
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => openEditModal(note)}
                              className="px-4 py-2 rounded-xl bg-cyan-900 text-white font-semibold hover:bg-cyan-800 transition"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteItem(note)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6">
              <Pagination
                currentPage={notePage}
                totalPages={totalNotePages}
                onPrev={() => setNotePage((p) => Math.max(1, p - 1))}
                onNext={() => setNotePage((p) => Math.min(totalNotePages, p + 1))}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* MODAL */}
      <Modal
        open={modalOpen}
        title={
          modalMode === "add"
            ? "Add New Entry"
            : modalMode === "edit"
            ? "Edit Entry"
            : "Entry Details"
        }
        onClose={() => setModalOpen(false)}
      >
        {/* DETAILS MODE */}
        {modalMode === "details" && selectedItem && (
          <div className="space-y-4 text-gray-800">
            <p className="text-sm font-semibold text-gray-600">
              Type:{" "}
              <span className="text-cyan-900 font-bold">{selectedItem.type}</span>
            </p>

            {"status" in selectedItem && (
              <div className="flex gap-2 items-center">
                <span className="text-sm font-semibold text-gray-600">Status:</span>
                <StatusBadge status={selectedItem.status} />
              </div>
            )}

            {"priority" in selectedItem && (
              <div className="flex gap-2 items-center">
                <span className="text-sm font-semibold text-gray-600">
                  Priority:
                </span>
                <PriorityBadge priority={selectedItem.priority} />
              </div>
            )}

            {"deadline" in selectedItem && (
              <p className="text-sm font-semibold text-gray-600">
                Deadline:{" "}
                <span className="text-gray-900 font-bold">
                  {selectedItem.deadline || "—"}
                </span>
              </p>
            )}

            {"createdAt" in selectedItem && (
              <p className="text-sm font-semibold text-gray-600">
                Created At:{" "}
                <span className="text-gray-900 font-bold">
                  {selectedItem.createdAt}
                </span>
              </p>
            )}

            {"name" in selectedItem && (
              <p className="text-sm font-semibold text-gray-600">
                Client Name:{" "}
                <span className="text-gray-900 font-bold">{selectedItem.name}</span>
              </p>
            )}

            {"project" in selectedItem && selectedItem.type === "Client" && (
              <p className="text-sm font-semibold text-gray-600">
                Project:{" "}
                <span className="text-gray-900 font-bold">{selectedItem.project}</span>
              </p>
            )}

            {"country" in selectedItem && (
              <p className="text-sm font-semibold text-gray-600">
                Country:{" "}
                <span className="text-gray-900 font-bold">
                  {selectedItem.country}
                </span>
              </p>
            )}

            <div className="bg-gray-50 border rounded-2xl p-5 leading-relaxed text-gray-800 whitespace-pre-wrap">
              {selectedItem.details}
            </div>
          </div>
        )}

        {/* ADD + EDIT MODE */}
        {(modalMode === "add" || modalMode === "edit") && (
          <div className="space-y-5">
            {/* TYPE SELECT */}
            {modalMode === "add" && (
              <div>
                <label className="block font-bold text-gray-700 mb-2">
                  Select Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as SectionType)}
                  className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                >
                  <option value="Task">Task</option>
                  <option value="Project">Project</option>
                  <option value="Client">Client</option>
                  <option value="Note">Note</option>
                </select>
              </div>
            )}

            {/* TASK / PROJECT */}
            {(selectedType === "Task" || selectedType === "Project") && (
              <>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Enter title..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as StatusType)}
                      className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) =>
                        setFormPriority(e.target.value as "Low" | "Medium" | "High")
                      }
                      className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Deadline (optional)
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 min-h-[150px] outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Write details..."
                  />
                </div>
              </>
            )}

            {/* CLIENT */}
            {selectedType === "Client" && (
              <>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Enter client name..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Project
                  </label>
                  <input
                    value={formClientProject}
                    onChange={(e) => setFormClientProject(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Enter project name..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    value={formClientCountry}
                    onChange={(e) => setFormClientCountry(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Enter country..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StatusType)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Deadline (optional)
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 min-h-[150px] outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Write details..."
                  />
                </div>
              </>
            )}

            {/* NOTE */}
            {selectedType === "Note" && (
              <>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Note Title
                  </label>
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Enter note title..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 min-h-[180px] outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="Write note..."
                  />
                </div>
              </>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 text-white font-extrabold py-4 rounded-2xl shadow-xl hover:opacity-95 transition"
            >
              {modalMode === "add" ? "Save Entry" : "Update Entry"}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}