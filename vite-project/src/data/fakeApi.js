// src/data/fakeApi.js

// Mock Data
export const classes = [
  { id: 1, name: "Web Development", instructor: "John Doe", students: 32 },
  { id: 2, name: "Data Structures", instructor: "Alice Smith", students: 28 },
  { id: 3, name: "AI & Machine Learning", instructor: "Bob Williams", students: 20 },
];

export const assignments = [
  { id: 1, classId: 1, title: "React Components", due: "2025-10-25" },
  { id: 2, classId: 2, title: "Linked List Implementation", due: "2025-10-22" },
  { id: 3, classId: 3, title: "AI Paper Summary", due: "2025-10-30" },
];

export const submissions = [
  { id: 1, assignmentId: 1, student: "Kanishka", status: "Submitted" },
  { id: 2, assignmentId: 2, student: "Kane", status: "Pending" },
  { id: 3, assignmentId: 3, student: "Alex", status: "Submitted" },
];

// Simulated delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fake API Functions
export const api = {
  getClasses: async () => {
    await delay(500);
    return classes;
  },
  getAssignments: async () => {
    await delay(500);
    return assignments;
  },
  getSubmissions: async () => {
    await delay(500);
    return submissions;
  },
};
