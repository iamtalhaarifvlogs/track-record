"use client";

import { useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type ItemStatus = "Pending" | "In Progress" | "Completed" | "On Hold";

type BaseItem = {
  id: number;
  title: string;
  status: ItemStatus;
  createdAt: string;
  details: string;
  priority: "Low" | "Medium" | "High";
};

type ClientItem = {
  id: number;
  name: string;
  status: ItemStatus;
  createdAt: string;
  details: string;
  project: string;
  country: string;
};

type NoteItem = {
  id: number;
  title: string;
  createdAt: string;
  details: string;
};

function StatusBadge({ status }: { status: ItemStatus }) {
  const styles =
    status === "Completed"
      ? "bg-green-100 text-green-800"
      : status === "In Progress"
      ? "bg-blue-100 text-blue-800"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-200 text-gray-800";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "Low" | "Medium" | "High" }) {
  const styles =
    priority === "High"
      ? "bg-red-100 text-red-800"
      : priority === "Medium"
      ? "bg-orange-100 text-orange-800"
      : "bg-emerald-100 text-emerald-800";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}
    >
      {priority}
    </span>
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

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 text-white">
          <h3 className="text-lg md:text-xl font-extrabold">{title}</h3>

          <button
            onClick={onClose}
            className="bg-white text-cyan-900 font-bold px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>

        <div className="p-6 text-gray-800 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const tasks: BaseItem[] = [
    {
      id: 1,
      title: "Finalize new client onboarding plan",
      status: "In Progress",
      createdAt: "2026-04-05",
      priority: "High",
      details:
        "Need to finalize onboarding workflow for new leads. Include proposal, pricing model, NDA, onboarding email, and follow-up reminders.",
    },
    {
      id: 2,
      title: "Publish LinkedIn post about EvoDynamics Vision case studies",
      status: "Pending",
      createdAt: "2026-04-04",
      priority: "Medium",
      details:
        "Draft post with storytelling style, include 2 case studies + CTA to website. Schedule at evening time.",
    },
    {
      id: 3,
      title: "Review Vercel deployment and optimize build time",
      status: "Pending",
      createdAt: "2026-04-02",
      priority: "Low",
      details:
        "Check unused packages, remove dead imports, verify image optimization and caching strategy.",
    },
    {
      id: 4,
      title: "Follow up with Australian client",
      status: "On Hold",
      createdAt: "2026-04-01",
      priority: "High",
      details:
        "Send reminder and request remaining portal requirements + branding assets. Confirm timeline and payment terms.",
    },
  ];

  const projects: BaseItem[] = [
    {
      id: 1,
      title: "Talha’s Diary Tracker (Personal)",
      status: "In Progress",
      createdAt: "2026-04-06",
      priority: "High",
      details:
        "Single-page portal with sections (Tasks, Projects, Clients, Notes) + modal-based details + pagination.",
    },
    {
      id: 2,
      title: "BuyNClose Portal",
      status: "In Progress",
      createdAt: "2026-03-15",
      priority: "High",
      details:
        "Real estate platform with learning portal + AI automation support. Need to finalize Dialogflow integration approach.",
    },
    {
      id: 3,
      title: "Premier Auto Plus Website Updates",
      status: "In Progress",
      createdAt: "2026-03-20",
      priority: "Medium",
      details:
        "Convert slide-style content into clean sections, implement John's feedback, improve CTA structure.",
    },
  ];

  const clients: ClientItem[] = [
    {
      id: 1,
      name: "Australian Business Client",
      project: "Next.js Landing Page",
      country: "Australia",
      status: "In Progress",
      createdAt: "2026-04-05",
      details:
        "Landing page with lead capture form, database integration, and modern responsive UI. Quoted $200 initial scope.",
    },
    {
      id: 2,
      name: "US Real Estate Client",
      project: "Monthly Retainer Services",
      country: "United States",
      status: "Pending",
      createdAt: "2026-03-29",
      details:
        "Potential retainer for website maintenance, app dev, and social media marketing. Need final negotiation.",
    },
    {
      id: 3,
      name: "Islamic University Project Client",
      project: "University Management System",
      country: "Pakistan",
      status: "On Hold",
      createdAt: "2026-03-10",
      details:
        "Scope defined in PKR. Pending approval and final agreement terms.",
    },
  ];

  const notes: NoteItem[] = [
    {
      id: 1,
      title: "Daily Reminder",
      createdAt: "2026-04-06",
      details:
        "Don’t overload yourself. Finish top 3 priorities only. Let the rest roll to tomorrow.",
    },
    {
      id: 2,
      title: "Marketing Idea",
      createdAt: "2026-04-05",
      details:
        "Case studies should feel like storytelling. Add dialogues + bottlenecks + final measurable outcomes.",
    },
    {
      id: 3,
      title: "Fitness Focus",
      createdAt: "2026-04-04",
      details:
        "Need to control fatigue and screen time. Add a daily break reminder feature inside the tracker.",
    },
  ];

  const [selectedItem, setSelectedItem] = useState<
    BaseItem | ClientItem | NoteItem | null
  >(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [taskPage, setTaskPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [notePage, setNotePage] = useState(1);

  const itemsPerPage = 5;

  function openDetails(item: any) {
    setSelectedItem(item);
    setModalOpen(true);
  }

  function closeModal() {
    setSelectedItem(null);
    setModalOpen(false);
  }

  const paginatedTasks = useMemo(() => {
    const start = (taskPage - 1) * itemsPerPage;
    return tasks.slice(start, start + itemsPerPage);
  }, [taskPage]);

  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * itemsPerPage;
    return projects.slice(start, start + itemsPerPage);
  }, [projectPage]);

  const paginatedClients = useMemo(() => {
    const start = (clientPage - 1) * itemsPerPage;
    return clients.slice(start, start + itemsPerPage);
  }, [clientPage]);

  const paginatedNotes = useMemo(() => {
    const start = (notePage - 1) * itemsPerPage;
    return notes.slice(start, start + itemsPerPage);
  }, [notePage]);

  const totalTaskPages = Math.ceil(tasks.length / itemsPerPage);
  const totalProjectPages = Math.ceil(projects.length / itemsPerPage);
  const totalClientPages = Math.ceil(clients.length / itemsPerPage);
  const totalNotePages = Math.ceil(notes.length / itemsPerPage);

  return (
    <>
      <Header />

      <main className="container mx-auto px-6 py-14 max-w-6xl space-y-20">
        {/* HERO */}
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-900 mb-5">
            Welcome Back, Talha 👋
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            This is your personal execution dashboard. Track tasks, projects,
            clients, and notes in one place — clean, simple, and fast.
          </p>
        </section>

        {/* TASKS */}
        <section id="tasks" className="scroll-mt-32">
          <h2 className="text-3xl font-extrabold text-cyan-900 mb-6">
            Tasks
          </h2>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                    <th className="px-6 py-4 font-bold">Created</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-5 font-semibold text-gray-900">
                        {task.title}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-5">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {task.createdAt}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => openDetails(task)}
                          className="px-5 py-2 rounded-xl bg-cyan-900 text-white font-semibold shadow hover:bg-cyan-800 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6">
              <Pagination
                currentPage={taskPage}
                totalPages={totalTaskPages}
                onPrev={() => setTaskPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setTaskPage((p) => Math.min(totalTaskPages, p + 1))
                }
              />
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="scroll-mt-32">
          <h2 className="text-3xl font-extrabold text-cyan-900 mb-6">
            Projects
          </h2>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                    <th className="px-6 py-4 font-bold">Created</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProjects.map((project) => (
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
                      <td className="px-6 py-5 text-gray-600">
                        {project.createdAt}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => openDetails(project)}
                          className="px-5 py-2 rounded-xl bg-cyan-900 text-white font-semibold shadow hover:bg-cyan-800 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
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
          <h2 className="text-3xl font-extrabold text-cyan-900 mb-6">
            Clients
          </h2>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold">Country</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedClients.map((client) => (
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
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => openDetails(client)}
                          className="px-5 py-2 rounded-xl bg-cyan-900 text-white font-semibold shadow hover:bg-cyan-800 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
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
          <h2 className="text-3xl font-extrabold text-cyan-900 mb-6">
            Notes
          </h2>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Created</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedNotes.map((note) => (
                    <tr
                      key={note.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-5 font-semibold text-gray-900">
                        {note.title}
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {note.createdAt}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => openDetails(note)}
                          className="px-5 py-2 rounded-xl bg-cyan-900 text-white font-semibold shadow hover:bg-cyan-800 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6">
              <Pagination
                currentPage={notePage}
                totalPages={totalNotePages}
                onPrev={() => setNotePage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setNotePage((p) => Math.min(totalNotePages, p + 1))
                }
              />
            </div>
          </div>
        </section>
      </main>

      {/* DETAILS MODAL */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selectedItem ? (selectedItem as any).title || (selectedItem as any).name : ""}
      >
        {selectedItem && (
          <div className="space-y-4">
            {"status" in selectedItem && (
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">Status:</span>
                <StatusBadge status={(selectedItem as any).status} />
              </div>
            )}

            {"priority" in selectedItem && (
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">Priority:</span>
                <PriorityBadge priority={(selectedItem as any).priority} />
              </div>
            )}

            {"createdAt" in selectedItem && (
              <p className="text-gray-700">
                <span className="font-bold">Created:</span>{" "}
                {(selectedItem as any).createdAt}
              </p>
            )}

            {"project" in selectedItem && (
              <p className="text-gray-700">
                <span className="font-bold">Project:</span>{" "}
                {(selectedItem as any).project}
              </p>
            )}

            {"country" in selectedItem && (
              <p className="text-gray-700">
                <span className="font-bold">Country:</span>{" "}
                {(selectedItem as any).country}
              </p>
            )}

            {"details" in selectedItem && (
              <p className="text-gray-800 leading-relaxed">
                <span className="font-bold text-gray-900">Details:</span>{" "}
                {(selectedItem as any).details}
              </p>
            )}
          </div>
        )}
      </Modal>

      <Footer />
    </>
  );
}