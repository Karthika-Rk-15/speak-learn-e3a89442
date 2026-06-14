export const weeklyActivity = [
  { day: "Mon", hours: 2.4, questions: 18 },
  { day: "Tue", hours: 3.1, questions: 24 },
  { day: "Wed", hours: 1.8, questions: 12 },
  { day: "Thu", hours: 4.2, questions: 32 },
  { day: "Fri", hours: 3.7, questions: 28 },
  { day: "Sat", hours: 5.1, questions: 41 },
  { day: "Sun", hours: 4.6, questions: 35 },
];

export const subjectPerformance = [
  { subject: "DSA", score: 92, target: 95 },
  { subject: "DBMS", score: 87, target: 90 },
  { subject: "OS", score: 78, target: 85 },
  { subject: "CN", score: 84, target: 88 },
  { subject: "AI", score: 95, target: 95 },
];

export const learningProgress = [
  { week: "W1", progress: 22 },
  { week: "W2", progress: 35 },
  { week: "W3", progress: 48 },
  { week: "W4", progress: 56 },
  { week: "W5", progress: 68 },
  { week: "W6", progress: 79 },
  { week: "W7", progress: 86 },
  { week: "W8", progress: 92 },
];

export const recentTopics = [
  { topic: "Binary Search Trees", subject: "DSA", date: "2h ago", duration: "32 min" },
  { topic: "Normalization (3NF)", subject: "DBMS", date: "5h ago", duration: "24 min" },
  { topic: "Process Scheduling", subject: "OS", date: "Yesterday", duration: "41 min" },
  { topic: "Neural Networks", subject: "AI", date: "Yesterday", duration: "58 min" },
  { topic: "TCP/IP Protocols", subject: "CN", date: "2 days ago", duration: "28 min" },
];

export const conversations = [
  { id: "1", title: "Explain Dijkstra's algorithm", time: "Just now" },
  { id: "2", title: "What is RAG architecture?", time: "1h ago" },
  { id: "3", title: "Difference between TCP and UDP", time: "3h ago" },
  { id: "4", title: "Quick sort time complexity", time: "Yesterday" },
  { id: "5", title: "Database indexing strategies", time: "2 days ago" },
  { id: "6", title: "Transformer architecture basics", time: "3 days ago" },
];

export const documents = [
  { id: "1", title: "Operating Systems Notes.pdf", subject: "OS", size: "2.4 MB", date: "Today", status: "Indexed" },
  { id: "2", title: "DSA Cheat Sheet.pdf", subject: "DSA", size: "1.1 MB", date: "Yesterday", status: "Indexed" },
  { id: "3", title: "DBMS Chapter 5.docx", subject: "DBMS", size: "856 KB", date: "2 days ago", status: "Indexed" },
  { id: "4", title: "Neural Networks Slides.pptx", subject: "AI", size: "5.7 MB", date: "1 week ago", status: "Processing" },
  { id: "5", title: "Network Protocols.pdf", subject: "CN", size: "3.2 MB", date: "1 week ago", status: "Indexed" },
  { id: "6", title: "AI Research Paper.pdf", subject: "AI", size: "1.8 MB", date: "2 weeks ago", status: "Indexed" },
];

export const sampleQuiz = [
  {
    q: "What is the time complexity of binary search on a sorted array of n elements?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: 1,
  },
  {
    q: "Which data structure uses LIFO order?",
    options: ["Queue", "Stack", "Linked List", "Heap"],
    answer: 1,
  },
  {
    q: "In DBMS, which normal form removes transitive dependencies?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 2,
  },
  {
    q: "Which OS scheduling algorithm can cause starvation?",
    options: ["FCFS", "Round Robin", "Priority Scheduling", "SJF (Preemptive)"],
    answer: 2,
  },
  {
    q: "What does RAG stand for in AI systems?",
    options: [
      "Random Access Generation",
      "Retrieval Augmented Generation",
      "Recursive AI Graph",
      "Recurrent Activation Gate",
    ],
    answer: 1,
  },
];

export const achievements = [
  { name: "Consistent Learner", desc: "24-day learning streak", icon: "Flame", color: "from-orange-500 to-pink-500" },
  { name: "Quiz Master", desc: "50+ quizzes completed", icon: "Trophy", color: "from-yellow-500 to-orange-500" },
  { name: "Fast Learner", desc: "Top 5% completion speed", icon: "Zap", color: "from-cyan-400 to-blue-500" },
  { name: "AI Explorer", desc: "Asked 1000+ AI questions", icon: "Sparkles", color: "from-purple-500 to-indigo-500" },
  { name: "Voice Pioneer", desc: "100+ voice sessions", icon: "Mic", color: "from-pink-500 to-rose-500" },
  { name: "Knowledge Seeker", desc: "Uploaded 25+ materials", icon: "BookOpen", color: "from-emerald-500 to-teal-500" },
];

export const testimonials = [
  {
    name: "Aarav Sharma",
    role: "CSE Student, IIT Madras",
    content: "LearnMate AI changed how I study. The voice assistant feels like having a personal tutor available 24/7. My DSA scores jumped from 70 to 94.",
    rating: 5,
  },
  {
    name: "Priya Krishnan",
    role: "GATE Aspirant",
    content: "Uploading my notes and asking questions directly is magical. It's like Notion AI but for serious learners. Saved me hundreds of hours.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Software Engineer",
    content: "I use LearnMate during my commute — voice-only learning is brilliant. The quiz generator helps me retain everything I cover.",
    rating: 5,
  },
  {
    name: "Sneha Iyer",
    role: "M.Tech Student",
    content: "The Tamil language support is incredible. Finally an AI tutor that meets me where I am. The analytics keep me motivated.",
    rating: 5,
  },
];
