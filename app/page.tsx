"use client";

import { useEffect, useState, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Search,
  ChevronDown,
  X,
  Trash2,
  Loader2,
  RefreshCw,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";

/* ─── Config ──────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const COURSES = [
  { id: "data-analyst",        label: "Data Analyst Bootcamp",        color: "#38bdf8", rgb: "56,189,248" },
  { id: "data-science",        label: "Data Science Bootcamp",        color: "#a78bfa", rgb: "167,139,250" },
  { id: "data-engineer",       label: "Data Engineering Bootcamp",    color: "#fb923c", rgb: "251,146,60" },
  { id: "production-support",  label: "100% Job-Assistance Bootcamp", color: "#34d399", rgb: "52,211,153" },
];

/* ─── Types ───────────────────────────────────────────────── */
interface Student {
  _id: string;
  fullName: string;
  email: string;
  clerkId: string;
  enrollmentId: string;
  enrollmentNumber: string;
  joinedMonth: string;
  zone: string;
  subscription: string;
  purchasedCourses: { _id: string; title: string }[];
  createdAt: string;
}

/* ─── Helpers ─────────────────────────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── Course Dropdown ─────────────────────────────────────── */
function CourseDropdown({
  studentId,
  current,
  onAssigned,
}: {
  studentId: string;
  current: string;
  onAssigned: (id: string, courseName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const removeCourse = async () => {
    if (!confirm("Remove course from this student?")) return;
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(
        `${API}/api/preplacement/admin/users/${studentId}/assign-course`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseName: "" }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      onAssigned(studentId, "");
    } catch (err) {
      alert("Failed to remove course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const assign = async (courseId: string, label: string) => {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(
        `${API}/api/preplacement/admin/users/${studentId}/assign-course`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseName: label }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      onAssigned(studentId, label);
    } catch (err) {
      alert("Failed to assign course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeCourse = COURSES.find((c) => c.label === current);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 10,
          border: activeCourse
            ? `1px solid rgba(${activeCourse.rgb},0.35)`
            : "1px solid rgba(255,255,255,0.1)",
          background: activeCourse
            ? `rgba(${activeCourse.rgb},0.08)`
            : "rgba(255,255,255,0.04)",
          color: activeCourse ? activeCourse.color : "rgba(255,255,255,0.5)",
          fontSize: 12,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease",
          minWidth: 160,
          justifyContent: "space-between",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
            Assigning...
          </>
        ) : (
          <>
            <span>{activeCourse ? activeCourse.label : "Assign Course"}</span>
            <ChevronDown size={12} style={{ opacity: 0.6 }} />
          </>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
          />

          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 20,
              background: "#13131f",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 6,
              minWidth: 200,
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            {COURSES.map((c) => (
              <button
                key={c.id}
                onClick={() => assign(c.id, c.label)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    current === c.label
                      ? `rgba(${c.rgb},0.1)`
                      : "transparent",
                  color: current === c.label ? c.color : "rgba(255,255,255,0.75)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `rgba(${c.rgb},0.08)`;
                  (e.currentTarget as HTMLButtonElement).style.color = c.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    current === c.label ? `rgba(${c.rgb},0.1)` : "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    current === c.label ? c.color : "rgba(255,255,255,0.75)";
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: c.color,
                    flexShrink: 0,
                  }}
                />
                {c.label}
                {current === c.label && (
                  <CheckCircle size={12} style={{ marginLeft: "auto", color: c.color }} />
                )}
              </button>
            ))}

            {/* Remove course option — only show if a course is assigned */}
            {current && (
              <>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                <button
                  onClick={removeCourse}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    color: "rgba(248,113,113,0.7)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.7)";
                  }}
                >
                  <Trash2 size={13} />
                  Remove Course
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Student Card (mobile) / Row (desktop) ───────────────── */
function StudentRow({
  student,
  onAssigned,
}: {
  student: Student;
  onAssigned: (id: string, courseName: string) => void;
}) {
  const currentCourse = student.purchasedCourses?.[0]?.title ?? "";
  const hasCourse = !!currentCourse;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "18px 20px",
        display: "grid",
        gridTemplateColumns: "40px 1fr auto",
        gap: 14,
        alignItems: "start",
        transition: "border-color 0.2s ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(255,255,255,0.1)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(255,255,255,0.06)")
      }
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "linear-gradient(135deg, #1e3a5f, #1e1b4b)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "#93c5fd",
          flexShrink: 0,
          border: "1px solid rgba(147,197,253,0.15)",
        }}
      >
        {initials(student.fullName ?? "")}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#fff",
            }}
          >
            {student.fullName}
          </span>

          {/* Status badge */}
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.05em",
              background: hasCourse
                ? "rgba(52,211,153,0.1)"
                : "rgba(251,191,36,0.1)",
              color: hasCourse ? "#34d399" : "#fbbf24",
              border: hasCourse
                ? "1px solid rgba(52,211,153,0.2)"
                : "1px solid rgba(251,191,36,0.2)",
            }}
          >
            {hasCourse ? "Course Assigned" : "Pending"}
          </span>


        </div>

        {/* Details */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 16px",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Mail size={10} /> {student.email}
          </span>
          {student.enrollmentId && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(56,189,248,0.7)" }}>
              <BookOpen size={10} /> {student.enrollmentId}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} /> {student.joinedMonth}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, textTransform: "capitalize" }}>
            <MapPin size={10} /> {student.zone} zone
          </span>
        </div>
      </div>

      {/* Course assign */}
      <CourseDropdown
        studentId={student._id}
        current={currentCourse}
        onAssigned={onAssigned}
      />
    </div>
  );
}

/* ─── Admin User ─────────────────────────────────────────────────────────── */
function AdminUser() {
  const { user } = useUser();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", margin: 0 }}>
          {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Admin"}
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>
      <UserButton />
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "assigned">("all");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/preplacement/admin/users?limit=200`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStudents(data.rows ?? []);
    } catch (err) {
      setError("Failed to load students. Check your API connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAssigned = (id: string, courseName: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              purchasedCourses: courseName
                ? [{ _id: "", title: courseName }]
                : [],
            }
          : s
      )
    );
  };

  /* Filtered list */
  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      (s.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.enrollmentId ?? "").toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "pending" && !s.purchasedCourses?.length) ||
      (filter === "assigned" && !!s.purchasedCourses?.length);

    return matchSearch && matchFilter;
  });

  const pendingCount  = students.filter((s) => !s.purchasedCourses?.length).length;
  const assignedCount = students.filter((s) => !!s.purchasedCourses?.length).length;

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#07070d",
          padding: "32px 20px 60px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 32 }}>
            <p
              style={{
                fontFamily: "'SF Mono','Fira Code',monospace",
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.18)",
                marginBottom: 8,
              }}
            >
              IT Jobs Factory · Admin Panel
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                }}
              >
                Admission Requests
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AdminUser />
                <button
                  onClick={fetchStudents}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <RefreshCw size={12} />
                Refresh
              </button>
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              { label: "Total", value: students.length, icon: Users, color: "#38bdf8", rgb: "56,189,248" },
              { label: "Pending", value: pendingCount, icon: Clock, color: "#fbbf24", rgb: "251,191,36" },
              { label: "Assigned", value: assignedCount, icon: CheckCircle, color: "#34d399", rgb: "52,211,153" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "16px 18px",
                  borderRadius: 14,
                  background: `rgba(${stat.rgb},0.05)`,
                  border: `1px solid rgba(${stat.rgb},0.12)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <stat.icon size={14} color={stat.color} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                    {stat.label}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 28,
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Search + Filter ── */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.25)",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or mobile..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    padding: 2,
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: 3,
                gap: 2,
              }}
            >
              {(["all", "pending", "assigned"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: filter === f ? "rgba(255,255,255,0.08)" : "transparent",
                    color: filter === f ? "#fff" : "rgba(255,255,255,0.35)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s ease",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* ── Student list ── */}
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "80px 0",
                color: "rgba(255,255,255,0.25)",
                fontSize: 14,
              }}
            >
              <Loader2
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Loading students...
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#f87171",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              <BookOpen
                size={32}
                style={{ opacity: 0.3, margin: "0 auto 12px" }}
              />
              <p style={{ fontSize: 14 }}>No students found</p>
            </div>
          ) : (
            <div
              className="fade-in"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {filtered.map((s) => (
                <StudentRow key={s._id} student={s} onAssigned={handleAssigned} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}