import { useEffect, useMemo, useState } from "react";

import Can from "../authorization/Can";
import { PERMISSIONS } from "../authorization/permissions";

import CourseForm from "../components/courses/CourseForm";

import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deactivateCourse,
} from "../services/course.api";

const EMPTY_STATE = {
  loading: true,
  error: "",
};

function formatFee(course) {
  if (course.feeMinor === null || course.feeMinor === undefined) {
    return "—";
  }

  return `${course.currencyCode || "PKR"} ${(
    course.feeMinor / 100
  ).toLocaleString()}`;
}

function formatModules(course) {
  if (!course.modules?.length) {
    return "—";
  }

  return course.modules.length === 1
    ? "1 module"
    : `${course.modules.length} modules`;
}

function CoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [state, setState] = useState(EMPTY_STATE);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [modal, setModal] = useState({
    open: false,
    mode: null,
    course: null,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  async function loadCourses() {
    setState({
      loading: true,
      error: "",
    });

    try {
      const response = await listCourses({
        search,
        status,
      });

      if (!response.success) {
        setState({
          loading: false,
          error: response.message || "Failed to load courses.",
        });

        return;
      }

      setCourses(response.courses || []);

      setState({
        loading: false,
        error: "",
      });
    } catch (error) {
      console.error(error);

      setState({
        loading: false,
        error: "Failed to load courses.",
      });
    }
  }

  useEffect(() => {
    loadCourses();
  }, [search, status]);

  const activeCount = useMemo(
    () => courses.filter((course) => course.status === "active").length,
    [courses],
  );

  const inactiveCount = useMemo(
    () => courses.filter((course) => course.status === "inactive").length,
    [courses],
  );

  function openCreate() {
    setActionError("");

    setModal({
      open: true,
      mode: "create",
      course: null,
    });
  }

  async function openView(course) {
    setActionError("");

    try {
      const response = await getCourse(course.id);

      if (!response.success) {
        setActionError(response.message || "Failed to load course.");

        return;
      }

      setModal({
        open: true,
        mode: "view",
        course: response.course,
      });
    } catch (error) {
      console.error(error);

      setActionError("Failed to load course.");
    }
  }

  async function openEdit(course) {
    setActionError("");

    try {
      const response = await getCourse(course.id);

      if (!response.success) {
        setActionError(response.message || "Failed to load course.");

        return;
      }

      setModal({
        open: true,
        mode: "edit",
        course: response.course,
      });
    } catch (error) {
      console.error(error);

      setActionError("Failed to load course.");
    }
  }

  function closeModal() {
    if (formLoading) return;

    setModal({
      open: false,
      mode: null,
      course: null,
    });
  }

  async function handleSubmit(formData) {
    setFormLoading(true);
    setActionError("");

    try {
      let response;

      if (modal.mode === "edit") {
        response = await updateCourse(modal.course.id, formData);
      } else {
        response = await createCourse(formData);
      }

      if (!response.success) {
        setActionError(response.message || "Course operation failed.");

        setFormLoading(false);

        return;
      }

      setModal({
        open: false,
        mode: null,
        course: null,
      });

      await loadCourses();
    } catch (error) {
      console.error(error);

      setActionError(error.message || "Course operation failed.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeactivate(course) {
    const confirmed = window.confirm(`Deactivate "${course.name}"?`);

    if (!confirmed) return;

    setActionError("");

    try {
      const response = await deactivateCourse(course.id);

      if (!response.success) {
        setActionError(response.message || "Failed to deactivate course.");

        return;
      }

      await loadCourses();
    } catch (error) {
      console.error(error);

      setActionError(error.message || "Failed to deactivate course.");
    }
  }

  return (
    <main className="courses-page">
      <section className="courses-header">
        <div>
          <span className="courses-eyebrow">ACADEMY</span>

          <h1>Courses</h1>

          <p>Manage academy courses, curriculum, duration and fees.</p>
        </div>

        <Can user={user} permission={PERMISSIONS.ACADEMY_COURSES_MANAGE}>
          <button className="course-primary-button" onClick={openCreate}>
            + New Course
          </button>
        </Can>
      </section>

      <section className="course-stats">
        <div className="course-stat-card">
          <span>Total Courses</span>
          <strong>{courses.length}</strong>
        </div>

        <div className="course-stat-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="course-stat-card">
          <span>Inactive</span>
          <strong>{inactiveCount}</strong>
        </div>
      </section>

      <section className="course-toolbar">
        <input
          className="course-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search courses..."
        />

        <select
          className="course-filter"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All Statuses</option>

          <option value="active">Active</option>

          <option value="inactive">Inactive</option>

          <option value="archived">Archived</option>
        </select>
      </section>

      {actionError && <div className="course-alert">{actionError}</div>}

      {state.error && <div className="course-alert">{state.error}</div>}

      <section className="course-table-card">
        {state.loading ? (
          <div className="course-empty">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="course-empty">
            <strong>No courses found.</strong>
            <span>Create your first course to get started.</span>
          </div>
        ) : (
          <div className="course-table-wrapper">
            <table className="course-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Duration</th>
                  <th>Sessions</th>
                  <th>Fee</th>
                  <th>Modules</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="course-name-cell">
                        <strong>{course.name}</strong>

                        <span>{course.courseCode}</span>
                      </div>
                    </td>

                    <td>
                      {course.durationWeeks
                        ? `${course.durationWeeks} weeks`
                        : "—"}
                    </td>

                    <td>
                      {course.totalSessions
                        ? `${course.totalSessions} total`
                        : "—"}

                      {course.sessionsPerWeek && (
                        <small>{course.sessionsPerWeek}/week</small>
                      )}
                    </td>

                    <td>{formatFee(course)}</td>

                    <td>{formatModules(course)}</td>

                    <td>
                      <span
                        className={`course-status course-status-${course.status}`}
                      >
                        {course.status}
                      </span>
                    </td>

                    <td>
                      <div className="course-actions">
                        <button
                          type="button"
                          className="course-action-button"
                          onClick={() => openView(course)}
                        >
                          View
                        </button>

                        <Can
                          user={user}
                          permission={PERMISSIONS.ACADEMY_COURSES_MANAGE}
                        >
                          <button
                            type="button"
                            className="course-action-button"
                            onClick={() => openEdit(course)}
                          >
                            Edit
                          </button>

                          {course.status !== "inactive" && (
                            <button
                              type="button"
                              className="course-action-button course-danger-button"
                              onClick={() => handleDeactivate(course)}
                            >
                              Deactivate
                            </button>
                          )}
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal.open && (
        <div
          className="course-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !formLoading) {
              closeModal();
            }
          }}
        >
          <div className="course-modal">
            <div className="course-modal-header">
              <div>
                <span className="courses-eyebrow">COURSE</span>

                <h2>
                  {modal.mode === "create"
                    ? "Create Course"
                    : modal.mode === "edit"
                      ? "Edit Course"
                      : "Course Details"}
                </h2>
              </div>

              <button
                type="button"
                className="course-modal-close"
                onClick={closeModal}
                disabled={formLoading}
              >
                ×
              </button>
            </div>

            <CourseForm
              course={modal.course}
              mode={modal.mode}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default CoursesPage;
