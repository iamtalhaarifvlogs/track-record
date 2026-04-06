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

  // Pagination
  const [taskPage, setTaskPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [notePage, setNotePage] = useState(1);

  const itemsPerPage = 5;

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "details">("add");
  const [selectedType, setSelectedType] = useState<SectionType>("Task");
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);

  // Shared form
  const [formTitle, setFormTitle] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formStatus, setFormStatus] = useState<StatusType>("Pending");
  const [formPriority, setFormPriority] = useState<"Low" | "Medium" | "High">(
    "Medium"
  );
  const [formDeadline, setFormDeadline] = useState("");

  // Client form
  const [formClientName, setFormClientName] = useState("");
  const [formClientCountry, setFormClientCountry] = useState("");

  // Relations
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
    }

    if (item.type === "Project") {
      setSelectedType("Project");
      setFormTitle(item.title);
      setFormDetails(item.details);
      setFormStatus(item.status);
      setFormPriority(item.priority);
      setFormDeadline(item.deadline || "");
      setFormSelectedClientId(item.clientId);
    }

    if (item.type === "Client") {
      setSelectedType("Client");
      setFormClientName(item.name);
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

    if (item.type === "Client") {
      const projectIds = projects
        .filter((p) => p.clientId === item.id)
        .map((p) => p.id);

      setClients((prev) => prev.filter((x) => x.id !== item.id));
      setProjects((prev) => prev.filter((p) => p.clientId !== item.id));
      setTasks((prev) => prev.filter((t) => !projectIds.includes(t.projectId)));
      return;
    }

    if (item.type === "Project") {
      setProjects((prev) => prev.filter((x) => x.id !== item.id));
      setTasks((prev) => prev.filter((t) => t.projectId !== item.id));
      return;
    }

    if (item.type === "Task") {
      setTasks((prev) => prev.filter((x) => x.id !== item.id));
      return;
    }

    if (item.type === "Note") {
      setNotes((prev) => prev.filter((x) => x.id !== item.id));
      return;
    }
  }

  function handleSave() {
    // ADD
    if (modalMode === "add") {
      // CLIENT
      if (selectedType === "Client") {
        if (!formClientName.trim()) return alert("Client name is required.");
        if (!formClientCountry.trim()) return alert("Country is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const newClient: ClientItem = {
          id: generateId(),
          type: "Client",
          name: formClientName,
          country: formClientCountry,
          status: formStatus,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
          details: formDetails,
        };

        setClients((prev) => [newClient, ...prev]);
        setModalOpen(false);
        resetForm();
        return;
      }

      // PROJECT
      if (selectedType === "Project") {
        if (!formTitle.trim()) return alert("Project title is required.");
        if (!formDetails.trim()) return alert("Details are required.");
        if (!formSelectedClientId.trim())
          return alert("Select a client for this project.");

        const client = clients.find((c) => c.id === formSelectedClientId);
        if (!client) return alert("Client not found.");

        const newProject: ProjectItem = {
          id: generateId(),
          type: "Project",
          title: formTitle,
          clientId: client.id,
          clientName: client.name,
          status: formStatus,
          priority: formPriority,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
          details: formDetails,
        };

        setProjects((prev) => [newProject, ...prev]);
        setModalOpen(false);
        resetForm();
        return;
      }

      // TASK
      if (selectedType === "Task") {
        if (!formTitle.trim()) return alert("Task title is required.");
        if (!formDetails.trim()) return alert("Details are required.");
        if (!formSelectedProjectId.trim())
          return alert("Select a project for this task.");

        const project = projects.find((p) => p.id === formSelectedProjectId);
        if (!project) return alert("Project not found.");

        const newTask: TaskItem = {
          id: generateId(),
          type: "Task",
          title: formTitle,
          projectId: project.id,
          projectTitle: project.title,
          status: formStatus,
          priority: formPriority,
          createdAt: formatDate(new Date()),
          deadline: formDeadline || undefined,
          details: formDetails,
        };

        setTasks((prev) => [newTask, ...prev]);
        setModalOpen(false);
        resetForm();
        return;
      }

      // NOTE
      if (selectedType === "Note") {
        if (!formTitle.trim()) return alert("Note title is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const newNote: NoteItem = {
          id: generateId(),
          type: "Note",
          title: formTitle,
          createdAt: formatDate(new Date()),
          details: formDetails,
        };

        setNotes((prev) => [newNote, ...prev]);
        setModalOpen(false);
        resetForm();
        return;
      }
    }

    // EDIT
    if (modalMode === "edit" && selectedItem) {
      if (selectedItem.type === "Client") {
        if (!formClientName.trim()) return alert("Client name is required.");
        if (!formClientCountry.trim()) return alert("Country is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const updated: ClientItem = {
          ...selectedItem,
          name: formClientName,
          country: formClientCountry,
          status: formStatus,
          deadline: formDeadline || undefined,
          details: formDetails,
        };

        setClients((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );

        // Update project clientName if changed
        setProjects((prev) =>
          prev.map((p) =>
            p.clientId === updated.id ? { ...p, clientName: updated.name } : p
          )
        );

        setModalOpen(false);
        resetForm();
        return;
      }

      if (selectedItem.type === "Project") {
        if (!formTitle.trim()) return alert("Project title is required.");
        if (!formDetails.trim()) return alert("Details are required.");
        if (!formSelectedClientId.trim())
          return alert("Select a client for this project.");

        const client = clients.find((c) => c.id === formSelectedClientId);
        if (!client) return alert("Client not found.");

        const updated: ProjectItem = {
          ...selectedItem,
          title: formTitle,
          clientId: client.id,
          clientName: client.name,
          details: formDetails,
          status: formStatus,
          priority: formPriority,
          deadline: formDeadline || undefined,
        };

        setProjects((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );

        // Update tasks projectTitle if changed
        setTasks((prev) =>
          prev.map((t) =>
            t.projectId === updated.id
              ? { ...t, projectTitle: updated.title }
              : t
          )
        );

        setModalOpen(false);
        resetForm();
        return;
      }

      if (selectedItem.type === "Task") {
        if (!formTitle.trim()) return alert("Task title is required.");
        if (!formDetails.trim()) return alert("Details are required.");
        if (!formSelectedProjectId.trim())
          return alert("Select a project for this task.");

        const project = projects.find((p) => p.id === formSelectedProjectId);
        if (!project) return alert("Project not found.");

        const updated: TaskItem = {
          ...selectedItem,
          title: formTitle,
          details: formDetails,
          status: formStatus,
          priority: formPriority,
          deadline: formDeadline || undefined,
          projectId: project.id,
          projectTitle: project.title,
        };

        setTasks((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );

        setModalOpen(false);
        resetForm();
        return;
      }

      if (selectedItem.type === "Note") {
        if (!formTitle.trim()) return alert("Note title is required.");
        if (!formDetails.trim()) return alert("Details are required.");

        const updated: NoteItem = {
          ...selectedItem,
          title: formTitle,
          details: formDetails,
        };

        setNotes((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );

        setModalOpen(false);
        resetForm();
        return;
      }
    }
  }

  function paginate<T>(items: T[], page: number) {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }

  const paginatedTasks = useMemo(() => paginate(tasks, taskPage), [
    tasks,
    taskPage,
  ]);
  const paginatedProjects = useMemo(
    () => paginate(projects, projectPage),
    [projects, projectPage]
  );
  const paginatedClients = useMemo(
    () => paginate(clients, clientPage),
    [clients, clientPage]
  );
  const paginatedNotes = useMemo(() => paginate(notes, notePage), [
    notes,
    notePage,
  ]);

  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / itemsPerPage));
  const totalProjectPages = Math.max(
    1,
    Math.ceil(projects.length / itemsPerPage)
  );
  const totalClientPages = Math.max(1, Math.ceil(clients.length / itemsPerPage));
  const totalNotePages = Math.max(1, Math.ceil(notes.length / itemsPerPage));

  return (
    <>
      <Header />

      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-cyan-900 text-white rounded-xl font-semibold shadow hover:bg-cyan-800 transition"
          >
            Add Entry
          </button>
        </div>

        {/* Example: display tasks */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Tasks</h2>
          {paginatedTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 mb-3 border rounded-xl shadow hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{task.title}</h3>
                <StatusBadge status={task.status} />
              </div>
              <p className="text-sm text-gray-600">{task.details}</p>
            </div>
          ))}

          <Pagination
            currentPage={taskPage}
            totalPages={totalTaskPages}
            onPrev={() => setTaskPage((p) => Math.max(1, p - 1))}
            onNext={() => setTaskPage((p) => Math.min(totalTaskPages, p + 1))}
          />
        </section>

        {/* Add similar sections for Projects, Clients, Notes */}

        <Modal
          open={modalOpen}
          title={
            modalMode === "add"
              ? "Add Entry"
              : modalMode === "edit"
              ? "Edit Entry"
              : "Details"
          }
          onClose={() => setModalOpen(false)}
        >
          {/* Modal content will go here */}
          <div>Form or details for {selectedType}</div>
        </Modal>
      </main>

      <Footer />
    </>
  );
}