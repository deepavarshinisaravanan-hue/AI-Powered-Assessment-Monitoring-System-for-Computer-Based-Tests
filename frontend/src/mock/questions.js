export const mockExam = {
  id: "exam-2201",
  title: "Data Structures & Algorithms — Mid Semester",
  subject: "Computer Science",
  durationMinutes: 30,
  totalMarks: 20,
  instructions: [
    "The exam contains 10 multiple-choice questions.",
    "Each question carries 2 marks. There is no negative marking.",
    "Your webcam and microphone must remain enabled throughout the exam.",
    "Do not exit fullscreen mode or switch browser tabs.",
    "The exam will auto-submit when the timer reaches zero.",
  ],
}

export const mockQuestions = [
  {
    id: "q1",
    text: "What is the time complexity of searching an element in a balanced binary search tree?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: 1,
  },
  {
    id: "q2",
    text: "Which data structure uses FIFO (First In First Out) ordering?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    answer: 1,
  },
  {
    id: "q3",
    text: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    answer: 2,
  },
  {
    id: "q4",
    text: "A hash table with a good hash function offers average lookup time of:",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    answer: 0,
  },
  {
    id: "q5",
    text: "Which traversal of a binary tree visits root, then left, then right?",
    options: ["Inorder", "Postorder", "Preorder", "Level order"],
    answer: 2,
  },
  {
    id: "q6",
    text: "The number of edges in a complete graph with n vertices is:",
    options: ["n", "n(n-1)/2", "n^2", "2n"],
    answer: 1,
  },
  {
    id: "q7",
    text: "Which algorithm is used to find the shortest path in a weighted graph?",
    options: ["DFS", "BFS", "Dijkstra's", "Kruskal's"],
    answer: 2,
  },
  {
    id: "q8",
    text: "A stack is best suited to implement which of the following?",
    options: ["Job scheduling", "Function call management", "Printer spooling", "BFS traversal"],
    answer: 1,
  },
  {
    id: "q9",
    text: "What is the space complexity of the recursive Fibonacci algorithm?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    answer: 1,
  },
  {
    id: "q10",
    text: "Which of the following is NOT a self-balancing binary search tree?",
    options: ["AVL Tree", "Red-Black Tree", "Splay Tree", "Binary Heap"],
    answer: 3,
  },
]
