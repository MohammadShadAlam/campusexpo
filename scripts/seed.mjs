import { Pool } from "pg";
import { randomBytes, scryptSync } from "crypto";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://neondb_owner:npg_lC3jYNV8mhsp@ep-square-dust-ax2pzazi.c-4.us-east-2.aws.neon.tech/neondb?sslmode=verify-full",
});

function hash(pw) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

const DEPT = "Computer Science & Engineering";
const PW = hash("password123");

const run = async () => {
  const c = await pool.connect();
  const exists = await c.query("select count(*)::int as n from users");
  if (exists.rows[0].n > 0) {
    console.log("Seed skipped — data already present.");
    c.release();
    await pool.end();
    return;
  }

  const mkUser = async (name, email, phone, role, status, dept = DEPT) =>
    (
      await c.query(
        `insert into users (full_name,email,phone,password_hash,role,status,department)
         values ($1,$2,$3,$4,$5,$6,$7) returning id`,
        [name, email, phone, PW, role, status, dept],
      )
    ).rows[0].id;

  // Admin
  const adminId = await mkUser("Dr. Meera Sharma", "admin@campusexpo.edu", "+91 90000 00001", "admin", "approved");

  // Teachers
  const teacherSeed = [
    ["Abdur Razzaque", "faculty@campusexpo.edu", "EMP-1001", "Associate Professor", "Data Structures, DBMS", true],
    ["Prof. Anil Verma", "anil.verma@campusexpo.edu", "EMP-1002", "Assistant Professor", "Operating Systems", false],
    ["Dr. Kavita Rao", "kavita.rao@campusexpo.edu", "EMP-1003", "Professor", "Computer Networks", false],
  ];
  const teacherIds = [];
  for (const [name, email, emp, desig, subs, full] of teacherSeed) {
    const id = await mkUser(name, email, "+91 90000 1" + emp.slice(-3), "teacher", "approved");
    const perms = {
      attendance: true,
      view_attendance: true,
      doubts: true,
      student_data: true,
      performance: true,
      approve_leave: full,
      create_assignment: full,
      study_material: full,
      announcement: full,
      broadcast: false,
      marks: full,
      timetable: false,
    };
    await c.query(
      `insert into teachers (user_id, employee_id, designation, subjects, permissions) values ($1,$2,$3,$4,$5)`,
      [id, emp, desig, subs, JSON.stringify(perms)],
    );
    teacherIds.push(id);
  }

  // Pending registrations
  const p1 = await mkUser("Rohit Nair", "rohit.nair@campusexpo.edu", "+91 90111 22233", "student", "pending");
  await c.query(
    `insert into students (user_id, roll_number, enrollment_number, course, year, semester, section, batch)
     values ($1,'CSE23-112','EN2023112','B.Tech CSE',2,4,'C','2023-2027')`,
    [p1],
  );
  const p2 = await mkUser("Sunita Iyer", "sunita.iyer@campusexpo.edu", "+91 90111 55566", "teacher", "pending");
  await c.query(
    `insert into teachers (user_id, employee_id, designation, subjects, permissions) values ($1,'EMP-1044','Assistant Professor','Software Engineering', $2)`,
    [p2, JSON.stringify({ attendance: true, view_attendance: true, doubts: true, student_data: true, performance: true })],
  );

  // Students
  const names = [
    "Aarav Sharma", "Isha Gupta", "Karan Mehta", "Priya Singh", "Rahul Das",
    "Sneha Patel", "Vikram Joshi", "Neha Kapoor", "Aditya Rao", "Tanvi Bose",
  ];
  const studentIds = [];
  let i = 0;
  for (const n of names) {
    i++;
    const email = i === 1 ? "student@campusexpo.edu" : `${n.split(" ")[0].toLowerCase()}${i}@campusexpo.edu`;
    const id = await mkUser(n, email, `+91 98${String(100000 + i).padStart(6, "0")}`, "student", "approved");
    await c.query(
      `insert into students (user_id, roll_number, enrollment_number, course, year, semester, section, batch, cgpa)
       values ($1,$2,$3,'B.Tech CSE',2,4,'C','2023-2027',$4)`,
      [id, `CSE23-${String(100 + i)}`, `EN2023${String(100 + i)}`, (7.5 + (i % 5) * 0.3).toFixed(1)],
    );
    studentIds.push(id);
  }

  // Subjects
  const subjectSeed = [
    ["CS401", "Design & Analysis of Algorithms", teacherIds[0]],
    ["CS402", "Database Management Systems", teacherIds[0]],
    ["CS403", "Operating Systems", teacherIds[1]],
    ["CS404", "Computer Networks", teacherIds[2]],
    ["CS405", "Software Engineering", teacherIds[1]],
  ];
  const subjectIds = [];
  for (const [code, name, tid] of subjectSeed) {
    const r = await c.query(
      `insert into subjects (code,name,department,semester,section,teacher_user_id,credits) values ($1,$2,$3,4,'C',$4,4) returning id`,
      [code, name, DEPT, tid],
    );
    subjectIds.push(r.rows[0].id);
  }

  // Timetable
  const slots = [
    [1, "09:00", "10:00", 0, "A-101"],
    [1, "10:15", "11:15", 1, "A-102"],
    [2, "09:00", "10:00", 2, "B-201"],
    [2, "11:30", "12:30", 3, "B-202"],
    [3, "09:00", "10:00", 4, "A-103"],
    [3, "10:15", "11:15", 0, "A-101"],
    [4, "09:00", "10:00", 1, "Lab-2"],
    [5, "11:30", "12:30", 2, "B-201"],
    [6, "09:00", "10:00", 3, "A-105"],
  ];
  for (const [day, st, en, si, room] of slots) {
    await c.query(
      `insert into timetable (day_of_week,start_time,end_time,subject_id,room,semester,section,class_type)
       values ($1,$2,$3,$4,$5,4,'C',$6)`,
      [day, st, en, subjectIds[si], room, room.startsWith("Lab") ? "Practical" : "Lecture"],
    );
  }
  // ensure today has classes
  const today = new Date().getDay() === 0 ? 1 : new Date().getDay();
  await c.query(
    `insert into timetable (day_of_week,start_time,end_time,subject_id,room,semester,section,class_type)
     values ($1,'14:00','15:00',$2,'A-104',4,'C','Lecture')`,
    [today, subjectIds[0]],
  );

  // Syllabus
  for (const sid of subjectIds.slice(0, 3)) {
    for (let u = 1; u <= 4; u++) {
      await c.query(
        `insert into syllabus_units (subject_id,unit_number,title,topics,completion) values ($1,$2,$3,$4,$5)`,
        [sid, u, `Unit ${u} Fundamentals`, "Core concepts, worked examples, case studies, lab exercises", Math.max(0, 100 - (u - 1) * 25)],
      );
    }
  }

  // Attendance (last 12 sessions)
  for (let d = 1; d <= 12; d++) {
    const date = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
    for (const sid of subjectIds.slice(0, 3)) {
      for (const stu of studentIds) {
        const status = Math.random() < 0.87 ? "present" : Math.random() < 0.5 ? "absent" : "late";
        await c.query(
          `insert into attendance (student_user_id,subject_id,marked_by_user_id,on_date,period,status)
           values ($1,$2,$3,$4,'1',$5)`,
          [stu, sid, teacherIds[0], date, status],
        );
      }
    }
  }

  // Assignments + submissions
  const asgIds = [];
  for (const [t, si, days, marks] of [
    ["Graph Algorithms Problem Set", 0, 5, 20],
    ["ER Diagram Case Study", 1, -2, 25],
    ["Process Scheduling Report", 2, 9, 15],
  ]) {
    const due = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
    const r = await c.query(
      `insert into assignments (title,subject_id,description,instructions,semester,section,due_date,priority,max_marks,created_by_user_id)
       values ($1,$2,$3,$4,4,'C',$5,'Normal',$6,$7) returning id`,
      [t, subjectIds[si], "Complete the given problems and submit a detailed report.", "Submit a single PDF. Cite all references. Plagiarism will be penalised.", due, marks, teacherIds[0]],
    );
    asgIds.push(r.rows[0].id);
  }
  for (const stu of studentIds.slice(0, 6)) {
    await c.query(
      `insert into submissions (assignment_id,student_user_id,content,file_name,status) values ($1,$2,$3,$4,'submitted')`,
      [asgIds[0], stu, "Submitted solutions for all five problems with complexity analysis.", "graph-problems.pdf"],
    );
  }

  // Results
  for (const stu of studentIds) {
    for (let sem = 1; sem <= 3; sem++) {
      for (const [code, name] of [["CS30" + sem, "Core Subject " + sem], ["MA20" + sem, "Mathematics " + sem]]) {
        const internal = 18 + Math.floor(Math.random() * 7);
        const external = 45 + Math.floor(Math.random() * 25);
        const gp = Math.min(10, Math.round((internal + external) / 10));
        await c.query(
          `insert into results (student_user_id,semester,subject_code,subject_name,internal,external,grade,grade_point,published)
           values ($1,$2,$3,$4,$5,$6,$7,$8,true)`,
          [stu, sem, code, name, internal, external, gp >= 9 ? "A+" : gp >= 8 ? "A" : "B+", String(gp)],
        );
      }
    }
  }

  // Study materials
  for (const [t, si, cat, file] of [
    ["Unit 1 — Algorithm Analysis Notes", 0, "Notes", "daa-unit1.pdf"],
    ["Normalization Cheat Sheet", 1, "PDF", "dbms-normalization.pdf"],
    ["DBMS Lab Manual 2026", 1, "Lab Manual", "dbms-lab-manual.pdf"],
    ["Previous Year Paper — OS", 2, "Previous Year Questions", "os-pyq-2025.pdf"],
  ]) {
    await c.query(
      `insert into study_materials (title,category,subject_id,semester,section,file_name,uploaded_by_user_id)
       values ($1,$2,$3,4,'C',$4,$5)`,
      [t, cat, subjectIds[si], file, teacherIds[0]],
    );
  }

  // Notices
  for (const [title, msg, cat, pri] of [
    ["Mid-Semester Examination Schedule", "Mid-semester exams begin from 12 March. Detailed datesheet is available on the notice board.", "Examination", "High"],
    ["Annual Tech Fest — Expo 2026", "Registrations for CampusExpo Tech Fest are now open across all departments.", "Events", "Normal"],
    ["Library Timings Extended", "The central library will remain open till 10 PM during examinations.", "General", "Normal"],
    ["Attendance Compliance Notice", "Students below 75% attendance will not be permitted to appear in end-semester examinations.", "Academic", "Urgent"],
  ]) {
    await c.query(
      `insert into notices (title,message,category,priority,created_by_user_id) values ($1,$2,$3,$4,$5)`,
      [title, msg, cat, pri, adminId],
    );
  }

  // Calendar
  for (const [title, kind, date] of [
    ["Semester Commencement", "Semester", "2026-01-05"],
    ["Internal Assessment I", "Exam", "2026-02-10"],
    ["Holi Break", "Holiday", "2026-03-04"],
    ["Practical Examinations", "Exam", "2026-04-20"],
    ["End Semester Examinations", "Exam", "2026-05-11"],
  ]) {
    await c.query(`insert into academic_calendar (title,kind,on_date) values ($1,$2,$3)`, [title, kind, date]);
  }

  // Leave + doubts
  await c.query(
    `insert into leave_requests (student_user_id,leave_type,from_date,to_date,reason) values ($1,'Medical','2026-03-02','2026-03-04','Viral fever, advised rest by physician.')`,
    [studentIds[1]],
  );
  await c.query(
    `insert into doubts (student_user_id,subject_id,question,status) values ($1,$2,'Could you explain the difference between BCNF and 3NF with an example?','new')`,
    [studentIds[0], subjectIds[1]],
  );

  // Notifications
  for (const stu of studentIds.slice(0, 4)) {
    await c.query(
      `insert into notifications (user_id,title,body,kind) values ($1,'New assignment uploaded','Graph Algorithms Problem Set is due soon.','assignment')`,
      [stu],
    );
  }

  await c.query(
    `insert into activity_logs (actor_user_id,actor_name,action,target) values ($1,'Dr. Meera Sharma','seeded the campus database','initial setup')`,
    [adminId],
  );

  c.release();
  await pool.end();
  console.log("Seed complete.");
};

run().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
