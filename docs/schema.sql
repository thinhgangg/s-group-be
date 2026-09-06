-- Users

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_role
        CHECK (role IN ('ADMIN', 'MEMBER'))
);


-- Classes

CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    mentor_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_classes_mentor
        FOREIGN KEY (mentor_id)
        REFERENCES users(id),

    CONSTRAINT chk_classes_date
        CHECK (end_date >= start_date)
);

CREATE INDEX idx_classes_mentor_id
ON classes(mentor_id);


-- Class members

CREATE TABLE class_members (
    class_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (class_id, member_id),

    CONSTRAINT fk_class_members_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_class_members_member
        FOREIGN KEY (member_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_class_members_member_id
ON class_members(member_id);


-- Lessons

CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    lesson_order INT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lessons_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lessons_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT chk_lessons_order
        CHECK (lesson_order > 0)
);

CREATE INDEX idx_lessons_class_id
ON lessons(class_id);

CREATE INDEX idx_lessons_created_by
ON lessons(created_by);


-- Lesson progress

CREATE TABLE lesson_progress (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_lesson_progress
        UNIQUE (lesson_id, member_id),

    CONSTRAINT fk_lesson_progress_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lesson_progress_member
        FOREIGN KEY (member_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_lesson_progress_member_id
ON lesson_progress(member_id);


-- Assignments

CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP NOT NULL,
    maximum_score DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignments_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_assignments_maximum_score
        CHECK (maximum_score > 0)
);

CREATE INDEX idx_assignments_class_id
ON assignments(class_id);


-- Submissions

CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    content TEXT,
    repository_url VARCHAR(500),
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(5,2),
    feedback TEXT,
    reviewed_at TIMESTAMP,

    CONSTRAINT fk_submissions_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES assignments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submissions_member
        FOREIGN KEY (member_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_submissions_score
        CHECK (score IS NULL OR score >= 0)
);

CREATE INDEX idx_submissions_assignment_id
ON submissions(assignment_id);

CREATE INDEX idx_submissions_member_id
ON submissions(member_id);
