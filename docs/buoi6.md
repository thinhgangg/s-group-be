## 1. Unique Constraints

`users.email`: mỗi email chỉ thuộc 1 người dùng

`class_members(class_id, member_id)`: 1 member không dc thêm 2 lần vào 1 class

`lesson_progress(lesson_id, member_id)`: 1 member chỉ dc hoàn thành 1 lesson 1 lần duy nhất

## 2. Indexes

`classes.mentor_id`: tìm nhanh những class mà 1 user đang làm mentor

`class_members.class_id`: lấy danh sách tất cả member đang tham gia 1 class, PRIMARY KEY `(class_id, member_id)`

`class_members.member_id`: lấy danh sách các class mà 1 member đang tham gia

`lessons.class_id`: lấy danh sách lesson của 1 class

`lesson_progress.lesson_id`: xem những member nào đã hoàn thành 1 lesson, UNIQUE `(lesson_id, member_id)`

`lesson_progress.member_id`: xem 1 member đã hoàn thành những lesson nào

`assignments.class_id`: lấy danh sách các assignment thuộc 1 class

`submissions.assignment_id`: mentor muốn xem tất cả bài nộp của 1 assignment

`submissions.member_id`: member muốn xem lại những assignment mà mình đã nộp
