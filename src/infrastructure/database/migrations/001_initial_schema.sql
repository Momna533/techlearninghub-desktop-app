CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at TEXT,
  disabled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role INTEGER NOT NULL DEFAULT 0 CHECK (is_system_role IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE RESTRICT
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  employee_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT COLLATE NOCASE,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'inactive', 'terminated')),
  hire_date TEXT NOT NULL,
  termination_date TEXT,
  base_salary_minor INTEGER CHECK (base_salary_minor IS NULL OR base_salary_minor >= 0),
  currency_code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (termination_date IS NULL OR termination_date >= hire_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE documents (
  id INTEGER PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  checksum_sha256 TEXT,
  uploaded_by_user_id INTEGER,
  description TEXT,
  uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  student_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT COLLATE NOCASE,
  phone TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  address TEXT,
  date_of_birth TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'withdrawn')),
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  course_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER CHECK (duration_weeks IS NULL OR duration_weeks > 0),
  default_fee_minor INTEGER CHECK (default_fee_minor IS NULL OR default_fee_minor >= 0),
  currency_code TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batches (
  id INTEGER PRIMARY KEY,
  course_id INTEGER NOT NULL,
  trainer_employee_id INTEGER,
  batch_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  schedule_json TEXT,
  fee_minor INTEGER CHECK (fee_minor IS NULL OR fee_minor >= 0),
  currency_code TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (end_date IS NULL OR end_date >= start_date),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  FOREIGN KEY (trainer_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  batch_id INTEGER,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  withdrawn_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'withdrawn', 'cancelled')),
  agreed_fee_minor INTEGER NOT NULL CHECK (agreed_fee_minor >= 0),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  currency_code TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, batch_id),
  CHECK (discount_minor <= agreed_fee_minor),
  CHECK (withdrawn_at IS NULL OR withdrawn_at >= enrolled_at),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE RESTRICT
);

CREATE TABLE attendance (
  id INTEGER PRIMARY KEY,
  enrollment_id INTEGER NOT NULL,
  attendance_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by_employee_id INTEGER,
  marked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  UNIQUE (enrollment_id, attendance_date),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE RESTRICT,
  FOREIGN KEY (marked_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE student_payments (
  id INTEGER PRIMARY KEY,
  enrollment_id INTEGER NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency_code TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'mobile_wallet', 'other')),
  reference_number TEXT,
  received_by_user_id INTEGER,
  paid_at TEXT NOT NULL,
  voided_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE RESTRICT,
  FOREIGN KEY (received_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE certificates (
  id INTEGER PRIMARY KEY,
  enrollment_id INTEGER NOT NULL UNIQUE,
  certificate_number TEXT NOT NULL UNIQUE,
  verification_code TEXT UNIQUE,
  grade TEXT,
  document_id INTEGER,
  issued_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE RESTRICT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  client_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT COLLATE NOCASE,
  phone TEXT,
  billing_address TEXT,
  tax_identifier TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id INTEGER PRIMARY KEY,
  company_name TEXT,
  contact_name TEXT,
  email TEXT COLLATE NOCASE,
  phone TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'converted')),
  estimated_value_minor INTEGER CHECK (estimated_value_minor IS NULL OR estimated_value_minor >= 0),
  currency_code TEXT,
  assigned_employee_id INTEGER,
  converted_client_id INTEGER UNIQUE,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (company_name IS NOT NULL OR contact_name IS NOT NULL),
  FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (converted_client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE proposals (
  id INTEGER PRIMARY KEY,
  proposal_number TEXT NOT NULL UNIQUE,
  lead_id INTEGER,
  client_id INTEGER,
  prepared_by_employee_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')),
  issued_at TEXT NOT NULL,
  valid_until TEXT,
  currency_code TEXT NOT NULL,
  tax_minor INTEGER NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  notes TEXT,
  accepted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((lead_id IS NOT NULL AND client_id IS NULL) OR (lead_id IS NULL AND client_id IS NOT NULL)),
  CHECK (valid_until IS NULL OR valid_until >= issued_at),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE RESTRICT,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (prepared_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE proposal_items (
  id INTEGER PRIMARY KEY,
  proposal_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_rate_basis_points INTEGER NOT NULL DEFAULT 0 CHECK (tax_rate_basis_points >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (discount_minor <= quantity * unit_price_minor),
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE RESTRICT
);

CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  team_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  lead_employee_id INTEGER,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE team_members (
  id INTEGER PRIMARY KEY,
  team_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  role_in_team TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  left_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (left_at IS NULL OR left_at >= joined_at),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  proposal_id INTEGER,
  project_manager_employee_id INTEGER,
  project_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  budget_minor INTEGER CHECK (budget_minor IS NULL OR budget_minor >= 0),
  contract_value_minor INTEGER CHECK (contract_value_minor IS NULL OR contract_value_minor >= 0),
  currency_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (end_date IS NULL OR end_date >= start_date),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL,
  FOREIGN KEY (project_manager_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE project_members (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  role_on_project TEXT NOT NULL,
  allocation_percent INTEGER CHECK (allocation_percent IS NULL OR allocation_percent BETWEEN 0 AND 100),
  joined_at TEXT NOT NULL,
  left_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (left_at IS NULL OR left_at >= joined_at),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT
);

CREATE TABLE milestones (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  due_date TEXT,
  completed_at TEXT,
  amount_minor INTEGER CHECK (amount_minor IS NULL OR amount_minor >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, sort_order),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  milestone_id INTEGER,
  parent_task_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TEXT,
  estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE RESTRICT,
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE RESTRICT
);

CREATE TABLE task_assignees (
  task_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  assignment_role TEXT,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, employee_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT
);

CREATE TABLE support_tickets (
  id INTEGER PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL,
  project_id INTEGER,
  assigned_employee_id INTEGER,
  reported_by_name TEXT,
  reported_by_email TEXT COLLATE NOCASE,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_client', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  opened_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  closed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  project_id INTEGER,
  proposal_id INTEGER,
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'voided')),
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  notes TEXT,
  sent_at TEXT,
  voided_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (due_date >= issue_date),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
);

CREATE TABLE invoice_items (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  milestone_id INTEGER,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_rate_basis_points INTEGER NOT NULL DEFAULT 0 CHECK (tax_rate_basis_points >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (discount_minor <= quantity * unit_price_minor),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE RESTRICT
);

CREATE TABLE invoice_payments (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency_code TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'mobile_wallet', 'other')),
  reference_number TEXT,
  received_by_user_id INTEGER,
  paid_at TEXT NOT NULL,
  voided_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  FOREIGN KEY (received_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE expenses (
  id INTEGER PRIMARY KEY,
  expense_number TEXT NOT NULL UNIQUE,
  project_id INTEGER,
  employee_id INTEGER,
  approved_by_user_id INTEGER,
  document_id INTEGER,
  expense_date TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor_name TEXT,
  description TEXT,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'reimbursed', 'paid', 'rejected', 'voided')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

CREATE TABLE salary_payments (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  processed_by_user_id INTEGER,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  gross_amount_minor INTEGER NOT NULL CHECK (gross_amount_minor >= 0),
  deductions_minor INTEGER NOT NULL DEFAULT 0 CHECK (deductions_minor >= 0),
  bonuses_minor INTEGER NOT NULL DEFAULT 0 CHECK (bonuses_minor >= 0),
  net_amount_minor INTEGER NOT NULL CHECK (net_amount_minor >= 0),
  currency_code TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'mobile_wallet', 'other')),
  reference_number TEXT,
  paid_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('draft', 'approved', 'paid', 'voided')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (employee_id, period_start, period_end),
  CHECK (period_end >= period_start),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  FOREIGN KEY (processed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE document_links (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  label TEXT,
  linked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (document_id, entity_type, entity_id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  entity_type TEXT,
  entity_id INTEGER,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY,
  actor_user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  before_json TEXT,
  after_json TEXT,
  device_context TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('system', 'user')),
  user_id INTEGER,
  setting_key TEXT NOT NULL,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((scope = 'system' AND user_id IS NULL) OR (scope = 'user' AND user_id IS NOT NULL)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_documents_uploaded_by_user_id ON documents(uploaded_by_user_id);
CREATE INDEX idx_documents_checksum_sha256 ON documents(checksum_sha256);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_name ON students(last_name, first_name);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_batches_course_id ON batches(course_id);
CREATE INDEX idx_batches_trainer_employee_id ON batches(trainer_employee_id);
CREATE INDEX idx_batches_status_start_date ON batches(status, start_date);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_batch_status ON enrollments(batch_id, status);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_student_payments_enrollment_paid_at ON student_payments(enrollment_id, paid_at);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_employee_id ON leads(assigned_employee_id);
CREATE INDEX idx_proposals_lead_id ON proposals(lead_id);
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposal_items_proposal_sort_order ON proposal_items(proposal_id, sort_order);
CREATE INDEX idx_teams_lead_employee_id ON teams(lead_employee_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_employee_id ON team_members(employee_id);
CREATE UNIQUE INDEX idx_team_members_active_unique ON team_members(team_id, employee_id) WHERE left_at IS NULL;
CREATE INDEX idx_projects_client_status ON projects(client_id, status);
CREATE INDEX idx_projects_manager_employee_id ON projects(project_manager_employee_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_employee_id ON project_members(employee_id);
CREATE UNIQUE INDEX idx_project_members_active_unique ON project_members(project_id, employee_id) WHERE left_at IS NULL;
CREATE INDEX idx_milestones_project_status ON milestones(project_id, status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_task_assignees_employee_id ON task_assignees(employee_id);
CREATE INDEX idx_support_tickets_client_status ON support_tickets(client_id, status);
CREATE INDEX idx_support_tickets_project_id ON support_tickets(project_id);
CREATE INDEX idx_support_tickets_assigned_employee_id ON support_tickets(assigned_employee_id);
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_due_date_status ON invoices(due_date, status);
CREATE INDEX idx_invoice_items_invoice_sort_order ON invoice_items(invoice_id, sort_order);
CREATE INDEX idx_invoice_payments_invoice_paid_at ON invoice_payments(invoice_id, paid_at);
CREATE INDEX idx_expenses_project_date ON expenses(project_id, expense_date);
CREATE INDEX idx_expenses_employee_id ON expenses(employee_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_salary_payments_employee_period ON salary_payments(employee_id, period_start, period_end);
CREATE INDEX idx_salary_payments_status ON salary_payments(status);
CREATE INDEX idx_document_links_entity ON document_links(entity_type, entity_id);
CREATE INDEX idx_notifications_user_read_at ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_user_created_at ON notifications(user_id, created_at);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_actor_user_id ON activity_logs(actor_user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE UNIQUE INDEX idx_settings_system_key ON settings(setting_key) WHERE scope = 'system';
CREATE UNIQUE INDEX idx_settings_user_key ON settings(user_id, setting_key) WHERE scope = 'user';
