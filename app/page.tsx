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

function ActionButtons({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 flex-wrap">
      <button
        onClick={onView}
        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 transition"
      >
        View
      </button>

      <button
        onClick={onEdit}
        className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold shadow hover:bg-amber-400 transition"
      >
        Edit
      </button>

      <button
        onClick={onDelete}
        className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-500 transition"
      >
        Delete
      </button>
    </div>
  );
}

export default function Page() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Pagination states
  const [taskPage, setTaskPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [notePage, setNotePage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "details">("add");
  const [selectedType, setSelectedType] = useState<SectionType>("Task");
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formStatus, setFormStatus] = useState<StatusType>("Pending");
  const [formPriority, setFormPriority] = useState<
    "Low" | "Medium" | "High"
  >("Medium");
  const [formDeadline, setFormDeadline] = useState("");

  // Client specific
  const [formClientName, setFormClientName] = useState("");
  const [formClientCountry, setFormClientCountry] = useState("");

  // Relations
  const [formSelectedClientId, setFormSelectedClientId] = useState("");
  const [formSelectedProjectId, setFormSelectedProjectId] = useState("");

  // Load data
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

  // Auto save
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
    if (!confirm(`Are you sure you want to delete this ${item.type}?`)) return;

    if (item.type === "Client") {
      const projectIds = projects
        .filter((p) => p.clientId === item.id)
        .map((p) => p.id);

      setClients((prev) => prev.filter((x) => x.id !== item.id));
      setProjects((prev) => prev.filter((p) => p.clientId !== item.id));
      setTasks((prev) =>
        prev.filter((t) => !projectIds.includes(t.projectId))
      );
    } else if (item.type === "Project") {
      setProjects((prev) => prev.filter((x) => x.id !== item.id));
      setTasks((prev) => prev.filter((t) => t.projectId !== item.id));
    } else if (item.type === "Task") {
      setTasks((prev) => prev.filter((x) => x.id !== item.id));
    } else if (item.type === "Note") {
      setNotes((prev) => prev.filter((x) => x.id !== item.id));
    }
  }

  function handleSave() {
    if (modalMode === "add") {
      if (selectedType === "Client") {
        if (!formClientName.trim()) return alert("Client name is required.");
        if (!formClientCountry.trim()) return alert("Country is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const newClient: ClientItem = {
          id: generateId(),
          type: "Client",
          name: formClientName.trim(),
          country: formClientCountry.trim(),
          status: formStatus,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
          details: formDetails.trim(),
        };

        setClients((prev) => [newClient, ...prev]);
      } else if (selectedType === "Project") {
        if (!formTitle.trim()) return alert("Project title is required.");
        if (!formDetails.trim()) return alert("Details are required.");
        if (!formSelectedClientId) return alert("Please select a client.");

        const client = clients.find((c) => c.id === formSelectedClientId);
        if (!client) return alert("Client not found.");

        const newProject: ProjectItem = {
          id: generateId(),
          type: "Project",
          title: formTitle.trim(),
          clientId: client.id,
          clientName: client.name,
          status: formStatus,
          priority: formPriority,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
          details: formDetails.trim(),
        };

        setProjects((prev) => [newProject, ...prev]);
      } else if (selectedType === "Task") {
        if (!formTitle.trim()) return alert("Task title is required.");
        if (!formDetails.trim()) return alert("Details are required.");
        if (!formSelectedProjectId) return alert("Please select a project.");

        const project = projects.find((p) => p.id === formSelectedProjectId);
        if (!project) return alert("Project not found.");

        const newTask: TaskItem = {
          id: generateId(),
          type: "Task",
          title: formTitle.trim(),
          projectId: project.id,
          projectTitle: project.title,
          status: formStatus,
          priority: formPriority,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
          details: formDetails.trim(),
        };

        setTasks((prev) => [newTask, ...prev]);
      } else if (selectedType === "Note") {
        if (!formTitle.trim()) return alert("Note title is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const newNote: NoteItem = {
          id: generateId(),
          type: "Note",
          title: formTitle.trim(),
          createdAt: formatDate(new Date()),
          details: formDetails.trim(),
        };

        setNotes((prev) => [newNote, ...prev]);
      }
    } else if (modalMode === "edit" && selectedItem) {
      if (selectedItem.type === "Client") {
        if (
          !formClientName.trim() ||
          !formClientCountry.trim() ||
          !formDetails.trim()
        )
          return alert("All fields are required.");

        const updated: ClientItem = {
          ...selectedItem,
          name: formClientName.trim(),
          country: formClientCountry.trim(),
          status: formStatus,
          deadline: formDeadline || undefined,
          details: formDetails.trim(),
        };

        setClients((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );

        setProjects((prev) =>
          prev.map((p) =>
            p.clientId === updated.id
              ? { ...p, clientName: updated.name }
              : p
          )
        );
      } else if (selectedItem.type === "Project") {
        if (!formTitle.trim() || !formDetails.trim() || !formSelectedClientId)
          return alert("Required fields missing.");

        const client = clients.find((c) => c.id === formSelectedClientId);
        if (!client) return alert("Client not found.");

        const updated: ProjectItem = {
          ...selectedItem,
          title: formTitle.trim(),
          clientId: client.id,
          clientName: client.name,
          status: formStatus,
          priority: formPriority,
          deadline: formDeadline || undefined,
          details: formDetails.trim(),
        };

        setProjects((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );

        setTasks((prev) =>
          prev.map((t) =>
            t.projectId === updated.id
              ? { ...t, projectTitle: updated.title }
              : t
          )
        );
      } else if (selectedItem.type === "Task") {
        if (!formTitle.trim() || !formDetails.trim() || !formSelectedProjectId)
          return alert("Required fields missing.");

        const project = projects.find((p) => p.id === formSelectedProjectId);
        if (!project) return alert("Project not found.");

        const updated: TaskItem = {
          ...selectedItem,
          title: formTitle.trim(),
          details: formDetails.trim(),
          status: formStatus,
          priority: formPriority,
          deadline: formDeadline || undefined,
          projectId: project.id,
          projectTitle: project.title,
        };

        setTasks((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );
      } else if (selectedItem.type === "Note") {
        if (!formTitle.trim() || !formDetails.trim())
          return alert("Required fields missing.");

        const updated: NoteItem = {
          ...selectedItem,
          title: formTitle.trim(),
          details: formDetails.trim(),
        };

        setNotes((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );
      }
    }

    setModalOpen(false);
    resetForm();
  }

  function paginate<T>(items: T[], page: number) {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }

  const paginatedTasks = useMemo(
    () => paginate(tasks, taskPage),
    [tasks, taskPage]
  );
  const paginatedProjects = useMemo(
    () => paginate(projects, projectPage),
    [projects, projectPage]
  );
  const paginatedClients = useMemo(
    () => paginate(clients, clientPage),
    [clients, clientPage]
  );
  const paginatedNotes = useMemo(
    () => paginate(notes, notePage),
    [notes, notePage]
  );

  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / itemsPerPage));
  const totalProjectPages = Math.max(
    1,
    Math.ceil(projects.length / itemsPerPage)
  );
  const totalClientPages = Math.max(
    1,
    Math.ceil(clients.length / itemsPerPage)
  );
  const totalNotePages = Math.max(1, Math.ceil(notes.length / itemsPerPage));

  return (
    <>
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-6xl space-y-20">
        {/* Hero */}
        <section className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 px-8 py-10 text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold">
              Talha&apos;s Diary Dashboard
            </h1>

            <p className="text-cyan-100 mt-3 max-w-3xl leading-relaxed">
              Track your tasks, projects, clients, and notes. Everything is saved
              automatically on your device.
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
                    <th className="px-6 py-4 font-bold">Start Date</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No tasks yet. Add your first task.
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((task) => (
                      <tr key={task.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {task.title}
                        </td>

                        <td className="px-6 py-5 text-gray-800 font-medium">
                          {task.projectTitle}
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
                          <ActionButtons
                            onView={() => openDetailsModal(task)}
                            onEdit={() => openEditModal(task)}
                            onDelete={() => deleteItem(task)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalTaskPages > 1 && (
              <div className="p-6 border-t">
                <Pagination
                  currentPage={taskPage}
                  totalPages={totalTaskPages}
                  onNext={() =>
                    setTaskPage((p) => Math.min(p + 1, totalTaskPages))
                  }
                  onPrev={() => setTaskPage((p) => Math.max(p - 1, 1))}
                />
              </div>
            )}
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
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                    <th className="px-6 py-4 font-bold">Start Date</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No projects yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {project.title}
                        </td>

                        <td className="px-6 py-5 text-gray-800 font-medium">
                          {project.clientName}
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
                          <ActionButtons
                            onView={() => openDetailsModal(project)}
                            onEdit={() => openEditModal(project)}
                            onDelete={() => deleteItem(project)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalProjectPages > 1 && (
              <div className="p-6 border-t">
                <Pagination
                  currentPage={projectPage}
                  totalPages={totalProjectPages}
                  onNext={() =>
                    setProjectPage((p) => Math.min(p + 1, totalProjectPages))
                  }
                  onPrev={() => setProjectPage((p) => Math.max(p - 1, 1))}
                />
              </div>
            )}
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
                    <th className="px-6 py-4 font-bold">Client Name</th>
                    <th className="px-6 py-4 font-bold">Country</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Start Date</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedClients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No clients yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedClients.map((client) => (
                      <tr key={client.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {client.name}
                        </td>

                        <td className="px-6 py-5 text-gray-800 font-medium">
                          {client.country}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={client.status} />
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {client.deadline || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <ActionButtons
                            onView={() => openDetailsModal(client)}
                            onEdit={() => openEditModal(client)}
                            onDelete={() => deleteItem(client)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalClientPages > 1 && (
              <div className="p-6 border-t">
                <Pagination
                  currentPage={clientPage}
                  totalPages={totalClientPages}
                  onNext={() =>
                    setClientPage((p) => Math.min(p + 1, totalClientPages))
                  }
                  onPrev={() => setClientPage((p) => Math.max(p - 1, 1))}
                />
              </div>
            )}
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
                    <th className="px-6 py-4 font-bold">Note Title</th>
                    <th className="px-6 py-4 font-bold">Created</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedNotes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No notes yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedNotes.map((note) => (
                      <tr key={note.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {note.title}
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {note.createdAt}
                        </td>

                        <td className="px-6 py-5">
                          <ActionButtons
                            onView={() => openDetailsModal(note)}
                            onEdit={() => openEditModal(note)}
                            onDelete={() => deleteItem(note)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalNotePages > 1 && (
              <div className="p-6 border-t">
                <Pagination
                  currentPage={notePage}
                  totalPages={totalNotePages}
                  onNext={() =>
                    setNotePage((p) => Math.min(p + 1, totalNotePages))
                  }
                  onPrev={() => setNotePage((p) => Math.max(p - 1, 1))}
                />
              </div>
            )}
          </div>
        </section>

        {/* ADD / EDIT MODAL */}
        <Modal
          open={modalOpen}
          title={
            modalMode === "add"
              ? `Add New ${selectedType}`
              : `Edit ${selectedType}`
          }
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
        >
          <div className="space-y-6">
            {/* Type Selector (only for Add) */}
            {modalMode === "add" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as SectionType)
                  }
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Task">Task</option>
                  <option value="Project">Project</option>
                  <option value="Client">Client</option>
                  <option value="Note">Note</option>
                </select>
              </div>
            )}

            {/* Client Fields */}
            {selectedType === "Client" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-2xl"
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formClientCountry}
                    onChange={(e) => setFormClientCountry(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-2xl"
                    placeholder="Country"
                  />
                </div>
              </>
            )}

            {/* Task & Project Fields */}
            {(selectedType === "Task" || selectedType === "Project") && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-2xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) =>
                      setFormPriority(
                        e.target.value as "Low" | "Medium" | "High"
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-2xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </>
            )}

            {/* Status (except Notes) */}
            {selectedType !== "Note" && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as StatusType)}
                  className="w-full p-3 border border-gray-300 rounded-2xl"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            )}

            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Details *
              </label>
              <textarea
                value={formDetails}
                onChange={(e) => setFormDetails(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-2xl"
                placeholder="Enter details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-2xl"
              />
            </div>

            {/* Relations */}
            {selectedType === "Project" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Client *
                </label>
                <select
                  value={formSelectedClientId}
                  onChange={(e) => setFormSelectedClientId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-2xl"
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedType === "Task" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project *
                </label>
                <select
                  value={formSelectedProjectId}
                  onChange={(e) => setFormSelectedProjectId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-2xl"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-8 border-t mt-8">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-8 py-3 bg-cyan-900 hover:bg-cyan-800 text-white font-semibold rounded-2xl transition"
              >
                {modalMode === "edit" ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          </div>
        </Modal>
      </main>

      <Footer />
    </>
  );
}