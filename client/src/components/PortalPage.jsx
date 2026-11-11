import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../api.js";

const portalContent = {
  student: {
    label: "STUDENT DASHBOARD",
    description: "Your assignments, attendance, and campus updates in one place."
  },
  faculty: {
    label: "FACULTY DASHBOARD",
    description: "Post assignments and keep student attendance up to date."
  },
  administration: {
    label: "ADMINISTRATION DASHBOARD",
    description: "Publish campus notices and oversee academic activity."
  }
};

async function requestJson(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return result;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function EmptyState({ children }) {
  return <p className="dashboard-empty">{children}</p>;
}

function DashboardPanel({ kicker, title, count, children, labelledBy }) {
  return (
    <section className="dashboard-panel" aria-labelledby={labelledBy}>
      <div className="dashboard-panel-heading">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2 id={labelledBy}>{title}</h2>
        </div>
        {count && <span className="dashboard-panel-count">{count}</span>}
      </div>
      {children}
    </section>
  );
}

function SummaryCard({ mark, label, value, detail, className = "" }) {
  return (
    <article className="dashboard-summary-card">
      <span className={`dashboard-summary-icon ${className}`}>{mark}</span>
      <div>
        <p>{label}</p>
        <strong>{value} <small>{detail}</small></strong>
      </div>
    </article>
  );
}

function NoticesPanel({ notices }) {
  return (
    <DashboardPanel
      kicker="CAMPUS CONNECT"
      title="Latest notices"
      count={`${notices.length} ${notices.length === 1 ? "notice" : "notices"}`}
      labelledBy="notices-title"
    >
      {notices.length ? (
        <div className="notice-grid">
          {notices.map((notice) => (
            <article className="notice-card" key={notice._id}>
              <div className="notice-card-meta">
                <span>{notice.category}</span>
                <time dateTime={notice.createdAt}>{formatDate(notice.createdAt)}</time>
              </div>
              <h3>{notice.title}</h3>
              <p>{notice.description}</p>
              {notice.createdBy?.name && <small>Posted by {notice.createdBy.name}</small>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>No notices have been published yet.</EmptyState>
      )}
    </DashboardPanel>
  );
}

function AssignmentList({ assignments }) {
  return (
    <div className="dashboard-list">
      {assignments.length ? assignments.map((assignment) => (
        <article className="dashboard-list-row" key={assignment._id}>
          <span className="dashboard-list-mark assignment-mark" aria-hidden="true">A</span>
          <div className="dashboard-list-copy">
            <strong>{assignment.title}</strong>
            <span>
              {assignment.course} · Due {formatDate(assignment.dueDate)}
              {assignment.createdBy?.name ? ` · ${assignment.createdBy.name}` : ""}
            </span>
            {assignment.description && <p>{assignment.description}</p>}
          </div>
        </article>
      )) : <EmptyState>No assignments have been posted yet.</EmptyState>}
    </div>
  );
}

function StudentDashboard({ data }) {
  const groupedAttendance = data.attendance.reduce((groups, record) => {
    const group = groups[record.course] || { present: 0, total: 0 };
    group.total += 1;
    if (record.status === "present") group.present += 1;
    groups[record.course] = group;
    return groups;
  }, {});
  const attendanceCourses = Object.entries(groupedAttendance);
  const totalSessions = data.attendance.length;
  const presentSessions = data.attendance.filter((record) => record.status === "present").length;
  const overallAttendance = totalSessions
    ? Math.round((presentSessions / totalSessions) * 100)
    : null;

  return (
    <>
      <section className="dashboard-summary-grid" aria-label="Student summary">
        <SummaryCard mark="A" label="Assignments" value={data.assignments.length} detail="posted" />
        <SummaryCard
          mark="%"
          className="attendance-icon"
          label="Overall attendance"
          value={overallAttendance === null ? "—" : `${overallAttendance}%`}
          detail={totalSessions ? `${presentSessions}/${totalSessions} present` : "no records"}
        />
        <SummaryCard
          mark="N"
          className="notices-icon"
          label="Campus notices"
          value={data.notices.length}
          detail="published"
        />
      </section>

      <DashboardPanel
        kicker="KEEP ON TRACK"
        title="Assignment list"
        count={`${data.assignments.length} assignments`}
        labelledBy="assignments-title"
      >
        <AssignmentList assignments={data.assignments} />
      </DashboardPanel>

      <DashboardPanel
        kicker="YOUR COURSE RECORD"
        title="Attendance"
        count={overallAttendance === null ? "No records yet" : `${overallAttendance}% overall`}
        labelledBy="attendance-title"
      >
        {attendanceCourses.length ? (
          <div className="attendance-list">
            {attendanceCourses.map(([course, stats]) => {
              const percentage = Math.round((stats.present / stats.total) * 100);
              return (
                <article className="attendance-row" key={course}>
                  <div className="attendance-row-heading">
                    <strong>{course}</strong>
                    <span>{stats.present} of {stats.total} classes · {percentage}%</span>
                  </div>
                  <div
                    className="attendance-progress-track"
                    role="progressbar"
                    aria-label={`${course} attendance`}
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState>Attendance has not been recorded yet.</EmptyState>}
      </DashboardPanel>

      <NoticesPanel notices={data.notices} />
    </>
  );
}

function AssignmentForm({ onCreated }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSubmitting(true);
    setMessage("");
    try {
      await requestJson("/api/dashboard/assignments", {
        method: "POST",
        body: JSON.stringify(values)
      });
      form.reset();
      setMessage("Assignment posted.");
      onCreated();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardPanel kicker="COURSE WORK" title="Post an assignment" labelledBy="post-assignment-title">
      <form className="staff-account-form" onSubmit={submit}>
        <label>Course<input name="course" maxLength={120} required /></label>
        <label>Assignment title<input name="title" maxLength={160} required /></label>
        <label>Due date<input name="dueDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
        <label className="form-wide">Description<textarea name="description" rows="3" maxLength={2000} /></label>
        <button type="submit" disabled={submitting}>{submitting ? "Posting..." : "Post assignment"}</button>
      </form>
      {message && <p className="staff-account-message" role="status">{message}</p>}
    </DashboardPanel>
  );
}

function AttendanceForm({ students, onCreated }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setSubmitting(true);
    setMessage("");
    try {
      await requestJson("/api/dashboard/attendance", {
        method: "POST",
        body: JSON.stringify(values)
      });
      setMessage("Attendance saved.");
      onCreated();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardPanel kicker="CLASS RECORDS" title="Record attendance" labelledBy="record-attendance-title">
      {students.length ? (
        <form className="staff-account-form" onSubmit={submit}>
          <label>
            Student
            <select name="studentId" defaultValue="" required>
              <option value="" disabled>Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
              ))}
            </select>
          </label>
          <label>Course<input name="course" maxLength={120} required /></label>
          <label>Date<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
          <label>
            Status
            <select name="status" defaultValue="present">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </label>
          <button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save attendance"}</button>
        </form>
      ) : (
        <EmptyState>Create student accounts before recording attendance.</EmptyState>
      )}
      {message && <p className="staff-account-message" role="status">{message}</p>}
    </DashboardPanel>
  );
}

function FacultyDashboard({ data, onChanged }) {
  return (
    <>
      <section className="dashboard-summary-grid" aria-label="Faculty summary">
        <SummaryCard mark="A" label="Assignments" value={data.assignments.length} detail="posted" />
        <SummaryCard mark="S" className="attendance-icon" label="Students" value={data.students.length} detail="registered" />
        <SummaryCard mark="R" className="notices-icon" label="Attendance records" value={data.attendance.length} detail="saved" />
      </section>
      <AssignmentForm onCreated={onChanged} />
      <AttendanceForm students={data.students} onCreated={onChanged} />
      <DashboardPanel
        kicker="YOUR TEACHING"
        title="Published assignments"
        count={`${data.assignments.length} assignments`}
        labelledBy="faculty-assignments-title"
      >
        <AssignmentList assignments={data.assignments} />
      </DashboardPanel>
      <DashboardPanel
        kicker="CLASS RECORDS"
        title="Recent attendance"
        count={`${data.attendance.length} records`}
        labelledBy="faculty-attendance-title"
      >
        {data.attendance.length ? (
          <div className="dashboard-list">
            {data.attendance.map((record) => (
              <article className="dashboard-list-row" key={record._id}>
                <span className={`dashboard-list-mark ${record.status === "present" ? "" : "faculty-mark"}`}>
                  {record.status === "present" ? "P" : "A"}
                </span>
                <div className="dashboard-list-copy">
                  <strong>{record.student?.name || "Student"} · {record.course}</strong>
                  <span>{formatDate(record.date)} · {record.student?.email}</span>
                </div>
                <span className={`dashboard-status ${record.status === "present" ? "status-complete" : "status-upcoming"}`}>
                  {record.status}
                </span>
              </article>
            ))}
          </div>
        ) : <EmptyState>No attendance records have been entered.</EmptyState>}
      </DashboardPanel>
      <NoticesPanel notices={data.notices} />
    </>
  );
}

function StaffAccountForm() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSubmitting(true);
    setMessage("");
    try {
      const result = await requestJson("/api/auth/users", {
        method: "POST",
        body: JSON.stringify(values)
      });
      form.reset();
      setMessage(`Created ${result.user.portal} account for ${result.user.email}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardPanel kicker="ACCOUNT ACCESS" title="Create staff account" labelledBy="create-account-title">
      <form className="staff-account-form" onSubmit={submit}>
        <label>Name<input name="name" autoComplete="name" maxLength={100} required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label>Temporary password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label>
        <label>
          Portal role
          <select name="portal" defaultValue="faculty">
            <option value="faculty">Faculty</option>
            <option value="administration">Administration</option>
          </select>
        </label>
        <button type="submit" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button>
      </form>
      {message && <p className="staff-account-message" role="status">{message}</p>}
    </DashboardPanel>
  );
}

function NoticeForm({ onCreated }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSubmitting(true);
    setMessage("");
    try {
      await requestJson("/api/dashboard/notices", {
        method: "POST",
        body: JSON.stringify(values)
      });
      form.reset();
      setMessage("Notice published.");
      onCreated();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardPanel kicker="CAMPUS CONNECT" title="Publish a notice" labelledBy="publish-notice-title">
      <form className="staff-account-form" onSubmit={submit}>
        <label>Title<input name="title" maxLength={160} required /></label>
        <label>
          Category
          <select name="category" defaultValue="General">
            <option>Academic</option>
            <option>Campus</option>
            <option>Event</option>
            <option>General</option>
          </select>
        </label>
        <label className="form-wide">Message<textarea name="description" rows="3" maxLength={2000} required /></label>
        <button type="submit" disabled={submitting}>{submitting ? "Publishing..." : "Publish notice"}</button>
      </form>
      {message && <p className="staff-account-message" role="status">{message}</p>}
    </DashboardPanel>
  );
}

function AdministrationDashboard({ data, onChanged }) {
  return (
    <>
      <section className="dashboard-summary-grid" aria-label="Administration summary">
        <SummaryCard mark="A" label="Assignments" value={data.assignments.length} detail="published" />
        <SummaryCard mark="R" className="attendance-icon" label="Attendance records" value={data.attendance.length} detail="saved" />
        <SummaryCard mark="N" className="notices-icon" label="Campus notices" value={data.notices.length} detail="published" />
      </section>
      <StaffAccountForm />
      <NoticeForm onCreated={onChanged} />
      <DashboardPanel
        kicker="ACADEMIC ACTIVITY"
        title="Published assignments"
        count={`${data.assignments.length} assignments`}
        labelledBy="administration-assignments-title"
      >
        <AssignmentList assignments={data.assignments} />
      </DashboardPanel>
      <NoticesPanel notices={data.notices} />
    </>
  );
}

const dashboardComponents = {
  student: StudentDashboard,
  faculty: FacultyDashboard,
  administration: AdministrationDashboard
};

function PortalPage({ portal }) {
  const navigate = useNavigate();
  const [logoutMessage, setLogoutMessage] = useState("");
  const [data, setData] = useState({
    assignments: [],
    attendance: [],
    notices: [],
    students: []
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const content = portalContent[portal];
  const Dashboard = dashboardComponents[portal];
  const user = JSON.parse(localStorage.getItem("campusAuthUser") || "null");

  useEffect(() => {
    let active = true;
    const endpoints = [
      requestJson("/api/dashboard/assignments"),
      requestJson("/api/dashboard/attendance"),
      requestJson("/api/dashboard/notices"),
      ...(portal === "faculty" ? [requestJson("/api/dashboard/students")] : [])
    ];

    Promise.all(endpoints)
      .then(([assignmentsResult, attendanceResult, noticesResult, studentsResult]) => {
        if (!active) return;
        setData({
          assignments: assignmentsResult.assignments,
          attendance: attendanceResult.attendance,
          notices: noticesResult.notices,
          students: studentsResult?.students || []
        });
        setDashboardError("");
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) {
          localStorage.removeItem("campusAuthUser");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("campusActivePortal");
          navigate("/login", { replace: true, state: { portal } });
          return;
        }
        setDashboardError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [navigate, portal, refreshKey]);

  async function handleLogout() {
    try {
      const response = await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok && response.status !== 401) {
        const result = await response.json();
        setLogoutMessage(result.message || "Unable to sign out.");
        return;
      }
    } catch {
      setLogoutMessage("Could not reach the server to sign out. Please try again.");
      return;
    }

    localStorage.removeItem("campusAuthUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("campusActivePortal");
    navigate("/");
  }

  return (
    <main className="portal-page portal-dashboard">
      <header className="portal-detail-header">
        <Link className="university-brand" to="/">
          <span className="university-badge">RV</span>
          <span>
            <strong>RV UNIVERSITY</strong>
            <small>School of Computer Science &amp; Engineering</small>
          </span>
        </Link>
        <nav aria-label="Portal navigation">
          <Link className="detail-home-link" to="/">Home</Link>
          <button className="header-logout" onClick={handleLogout}>Log out</button>
        </nav>
      </header>
      {logoutMessage && <p className="auth-message" role="alert">{logoutMessage}</p>}

      <section className={`dashboard-hero dashboard-hero-${portal}`}>
        <div>
          <p className="section-kicker">{content.label}</p>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ""}.</h1>
          <p>{content.description}</p>
        </div>
        <span className="dashboard-hero-mark" aria-hidden="true">
          {portal === "student" ? "S" : portal === "faculty" ? "F" : "A"}
        </span>
      </section>

      <div className="dashboard-content">
        {loading ? (
          <p className="dashboard-loading" role="status">Loading dashboard…</p>
        ) : dashboardError ? (
          <div className="dashboard-error" role="alert">
            <p>{dashboardError}</p>
            <button type="button" onClick={() => {
              setLoading(true);
              setRefreshKey((key) => key + 1);
            }}>
              Try again
            </button>
          </div>
        ) : (
          <Dashboard
            data={data}
            onChanged={() => {
              setLoading(true);
              setRefreshKey((key) => key + 1);
            }}
          />
        )}
      </div>
    </main>
  );
}

export default PortalPage;
