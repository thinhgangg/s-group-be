-- =============================================================
-- S-Group Learning Platform — Database Schema
-- RBAC: users → user_roles → roles → role_permissions → permissions
-- User có thể submit nhiều lần (no UNIQUE on assignmentId+memberId)
-- =============================================================

-- -------------------------------------------------------------
-- EXTENSION
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- cho gen_random_uuid() nếu cần

-- =============================================================
-- RBAC TABLES
-- =============================================================

-- Bảng permissions: hạt nhân của RBAC
-- Dùng chuỗi dạng RESOURCE_ACTION, ví dụ: USER_READ, CLASS_CREATE
CREATE TABLE IF NOT EXISTS permissions (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,  -- vd: USER_READ, CLASS_CREATE
    description TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng roles: nhóm quyền
CREATE TABLE IF NOT EXISTS roles (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,  -- ADMIN, MEMBER
    description TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian: role <-> permission (nhiều-nhiều)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,

    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_rp_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rp_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(id)
        ON DELETE CASCADE
);

-- =============================================================
-- CORE USER TABLE
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,           -- bcrypt hash
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian: user <-> role (nhiều-nhiều, một user có thể có nhiều role)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id     BIGINT    NOT NULL,
    role_id     BIGINT    NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_ur_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ur_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

-- =============================================================
-- CLASS
-- =============================================================

CREATE TABLE IF NOT EXISTS classes (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    start_date  DATE,
    end_date    DATE,
    mentor_id   BIGINT,                          -- NULL nếu chưa có mentor
    created_by  BIGINT       NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_class_mentor
        FOREIGN KEY (mentor_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_class_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_class_dates
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Bảng trung gian: class <-> member
-- Business rule: một member không được thêm hai lần vào cùng một class
CREATE TABLE IF NOT EXISTS class_members (
    class_id    BIGINT    NOT NULL,
    member_id   BIGINT    NOT NULL,
    joined_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (class_id, member_id),

    CONSTRAINT fk_cm_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cm_member
        FOREIGN KEY (member_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =============================================================
-- LESSON
-- =============================================================

CREATE TABLE IF NOT EXISTS lessons (
    id          BIGSERIAL    PRIMARY KEY,
    class_id    BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT,
    "order"     INTEGER      NOT NULL DEFAULT 0,
    created_by  BIGINT       NOT NULL,           -- mentor tạo lesson
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lesson_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lesson_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_lesson_order
        CHECK ("order" >= 0)
);

-- =============================================================
-- LESSON PROGRESS
-- =============================================================

-- Lưu trạng thái member đã hoàn thành lesson
-- Mỗi (lesson, member) chỉ có 1 bản ghi
CREATE TABLE IF NOT EXISTS lesson_progress (
    id           BIGSERIAL PRIMARY KEY,
    lesson_id    BIGINT    NOT NULL,
    member_id    BIGINT    NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_lp_lesson_member
        UNIQUE (lesson_id, member_id),

    CONSTRAINT fk_lp_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lp_member
        FOREIGN KEY (member_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =============================================================
-- ASSIGNMENT
-- =============================================================

CREATE TABLE IF NOT EXISTS assignments (
    id            BIGSERIAL    PRIMARY KEY,
    class_id      BIGINT       NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    deadline      TIMESTAMP,
    maximum_score INTEGER      NOT NULL DEFAULT 100,
    created_by    BIGINT       NOT NULL,           -- mentor tạo assignment
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_assignment_max_score
        CHECK (maximum_score > 0)
);

-- =============================================================
-- SUBMISSION
-- =============================================================
-- User có thể submit NHIỀU LẦN: không có UNIQUE (assignment_id, member_id)
-- Dùng submission_number để đánh số lần submit (1, 2, 3...)
-- Mentor review từng submission hoặc submission mới nhất

CREATE TABLE IF NOT EXISTS submissions (
    id                BIGSERIAL    PRIMARY KEY,
    assignment_id     BIGINT       NOT NULL,
    member_id         BIGINT       NOT NULL,
    submission_number INTEGER      NOT NULL DEFAULT 1,  -- lần submit thứ mấy
    content           TEXT,
    repository_url    VARCHAR(1000),
    submitted_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Review fields (Mentor điền sau khi chấm)
    score             INTEGER,
    feedback          TEXT,
    reviewed_by       BIGINT,
    reviewed_at       TIMESTAMP,

    CONSTRAINT uq_submission_number
        UNIQUE (assignment_id, member_id, submission_number),

    CONSTRAINT fk_sub_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES assignments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sub_member
        FOREIGN KEY (member_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sub_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_sub_score
        CHECK (score IS NULL OR score >= 0)
);

-- =============================================================
-- FILE UPLOADS
-- =============================================================

CREATE TABLE IF NOT EXISTS uploads (
    id            BIGSERIAL     PRIMARY KEY,
    uploaded_by   BIGINT        NOT NULL,
    object_key    VARCHAR(500)  NOT NULL UNIQUE,
    url           VARCHAR(1000) NOT NULL UNIQUE,
    original_name VARCHAR(500)  NOT NULL,
    mime_type     VARCHAR(255)  NOT NULL,
    size          BIGINT        NOT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_uploads_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_uploads_size
        CHECK (size > 0)
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id       ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id       ON user_roles(role_id);

CREATE INDEX IF NOT EXISTS idx_rp_role_id               ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_rp_permission_id         ON role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_classes_mentor_id        ON classes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_classes_created_by       ON classes(created_by);

CREATE INDEX IF NOT EXISTS idx_cm_class_id              ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_cm_member_id             ON class_members(member_id);

CREATE INDEX IF NOT EXISTS idx_lessons_class_id         ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class_order      ON lessons(class_id, "order");

CREATE INDEX IF NOT EXISTS idx_lp_lesson_id             ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lp_member_id             ON lesson_progress(member_id);

CREATE INDEX IF NOT EXISTS idx_assignments_class_id     ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline     ON assignments(deadline);

CREATE INDEX IF NOT EXISTS idx_sub_assignment_id        ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_sub_member_id            ON submissions(member_id);
CREATE INDEX IF NOT EXISTS idx_sub_assignment_member    ON submissions(assignment_id, member_id);

CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_by      ON uploads(uploaded_by);

-- =============================================================
-- SEED: PERMISSIONS
-- =============================================================

INSERT INTO permissions (name, description) VALUES
    -- User management
    ('USER_READ',           'Xem danh sách và thông tin user'),
    ('USER_CREATE',         'Tạo user mới'),
    ('USER_UPDATE',         'Cập nhật thông tin user'),
    ('USER_DELETE',         'Xóa user'),

    -- Class
    ('CLASS_READ',          'Xem class'),
    ('CLASS_CREATE',        'Tạo class mới'),
    ('CLASS_UPDATE',        'Cập nhật class'),
    ('CLASS_DELETE',        'Xóa class'),

    -- Class members
    ('CLASS_MEMBER_ADD',    'Thêm member vào class'),
    ('CLASS_MEMBER_REMOVE', 'Xóa member khỏi class'),

    -- Lesson
    ('LESSON_READ',         'Xem lesson'),
    ('LESSON_CREATE',       'Tạo lesson'),
    ('LESSON_UPDATE',       'Cập nhật lesson'),
    ('LESSON_DELETE',       'Xóa lesson'),
    ('LESSON_COMPLETE',     'Đánh dấu lesson hoàn thành'),

    -- Assignment
    ('ASSIGNMENT_READ',     'Xem assignment'),
    ('ASSIGNMENT_CREATE',   'Tạo assignment'),
    ('ASSIGNMENT_UPDATE',   'Cập nhật assignment'),
    ('ASSIGNMENT_DELETE',   'Xóa assignment'),

    -- Submission
    ('SUBMISSION_CREATE',   'Nộp bài (submit)'),
    ('SUBMISSION_READ_OWN', 'Xem submission của chính mình'),
    ('SUBMISSION_READ_ALL', 'Xem tất cả submission trong class'),
    ('SUBMISSION_REVIEW',   'Chấm điểm và viết feedback'),

    -- Upload
    ('UPLOAD_CREATE',       'Upload file')

ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- SEED: ROLES
-- =============================================================

INSERT INTO roles (name, description) VALUES
    ('ADMIN',  'Quản trị viên, có toàn quyền'),
    ('MEMBER', 'Thành viên học viên')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- SEED: ROLE_PERMISSIONS
-- =============================================================

-- ADMIN: tất cả quyền
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM   roles r
CROSS  JOIN permissions p
WHERE  r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- MEMBER: quyền giới hạn
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM   roles r
JOIN   permissions p ON p.name IN (
    'CLASS_READ',
    'LESSON_READ',
    'LESSON_COMPLETE',
    'ASSIGNMENT_READ',
    'SUBMISSION_CREATE',
    'SUBMISSION_READ_OWN',
    'UPLOAD_CREATE'
)
WHERE  r.name = 'MEMBER'
ON CONFLICT DO NOTHING;

-- =============================================================
-- NOTE: MENTOR
-- =============================================================
-- Mentor KHÔNG có role riêng trong MVP.
-- Một user được xem là Mentor của một class khi:
--   classes.mentor_id = user.id
--
-- Các quyền Mentor (LESSON_CREATE, ASSIGNMENT_CREATE, SUBMISSION_REVIEW...)
-- được kiểm tra ở application layer bằng middleware isMentorOfClass.
-- Ví dụ:
--   SELECT 1 FROM classes WHERE id = $classId AND mentor_id = $userId
