import { addDays, format, subDays } from "date-fns";

const today = new Date();

export const demoProfile = {
  id: "demo-profile",
  user_id: "demo-user",
  display_name: "Demo Student",
  avatar_url: null,
  study_streak: 7,
  daily_study_hours: 5,
  last_study_date: format(subDays(today, 1), "yyyy-MM-dd"),
  created_at: today.toISOString(),
  updated_at: today.toISOString(),
};

export const demoSubjects = [
  {
    id: "sub-1",
    user_id: "demo-user",
    name: "Unix & Shell Programming",
    exam_date: format(addDays(today, 18), "yyyy-MM-dd"),
    color: "#8B5CF6",
    pass_percentage: 70,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  },
  {
    id: "sub-2",
    user_id: "demo-user",
    name: "Wireless Communication",
    exam_date: format(addDays(today, 22), "yyyy-MM-dd"),
    color: "#3B82F6",
    pass_percentage: 60,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  },
  {
    id: "sub-3",
    user_id: "demo-user",
    name: "Cyber Physical Systems",
    exam_date: format(addDays(today, 26), "yyyy-MM-dd"),
    color: "#10B981",
    pass_percentage: 70,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  },
  {
    id: "sub-4",
    user_id: "demo-user",
    name: "Ethical Hacking",
    exam_date: format(addDays(today, 30), "yyyy-MM-dd"),
    color: "#EF4444",
    pass_percentage: 80,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  },
];

export const demoTopics = [
  // Unix & Shell Programming
  { id: "top-1", user_id: "demo-user", subject_id: "sub-1", name: "UNIX System Overview & Program Processes", importance: "high", is_completed: true, created_at: today.toISOString() },
  { id: "top-2", user_id: "demo-user", subject_id: "sub-1", name: "File I/O & File Descriptors", importance: "high", is_completed: true, created_at: today.toISOString() },
  { id: "top-3", user_id: "demo-user", subject_id: "sub-1", name: "Directories, Stat, File Permissions", importance: "medium", is_completed: true, created_at: today.toISOString() },
  { id: "top-4", user_id: "demo-user", subject_id: "sub-1", name: "Process Environment & Memory Layout", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-5", user_id: "demo-user", subject_id: "sub-1", name: "Process Control (fork, vfork, wait)", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-6", user_id: "demo-user", subject_id: "sub-1", name: "Signals & Signal Handling", importance: "medium", is_completed: false, created_at: today.toISOString() },
  { id: "top-7", user_id: "demo-user", subject_id: "sub-1", name: "Threads & Synchronization", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-8", user_id: "demo-user", subject_id: "sub-1", name: "Shell Scripting (variables, loops, conditionals)", importance: "high", is_completed: false, created_at: today.toISOString() },

  // Wireless Communication
  { id: "top-9", user_id: "demo-user", subject_id: "sub-2", name: "Evolution of Mobile Communications", importance: "medium", is_completed: true, created_at: today.toISOString() },
  { id: "top-10", user_id: "demo-user", subject_id: "sub-2", name: "Propagation Models & Path Loss", importance: "high", is_completed: true, created_at: today.toISOString() },
  { id: "top-11", user_id: "demo-user", subject_id: "sub-2", name: "Small Scale Multipath Propagation", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-12", user_id: "demo-user", subject_id: "sub-2", name: "Modulation Techniques (ASK, PSK, FSK, MSK)", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-13", user_id: "demo-user", subject_id: "sub-2", name: "Spread Spectrum & Cellular Concepts", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-14", user_id: "demo-user", subject_id: "sub-2", name: "Frequency Reuse & Handoff Strategies", importance: "medium", is_completed: false, created_at: today.toISOString() },
  { id: "top-15", user_id: "demo-user", subject_id: "sub-2", name: "Mobile IP & IEEE 802.11 Standards", importance: "medium", is_completed: false, created_at: today.toISOString() },

  // Cyber Physical Systems
  { id: "top-16", user_id: "demo-user", subject_id: "sub-3", name: "CPS Introduction & Application Domains", importance: "medium", is_completed: true, created_at: today.toISOString() },
  { id: "top-17", user_id: "demo-user", subject_id: "sub-3", name: "CPS HW Platforms, Sensors & Actuators", importance: "high", is_completed: true, created_at: today.toISOString() },
  { id: "top-18", user_id: "demo-user", subject_id: "sub-3", name: "CPS Networks (Wireless, CAN, Automotive Ethernet)", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-19", user_id: "demo-user", subject_id: "sub-3", name: "Synchronous & Asynchronous Models", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-20", user_id: "demo-user", subject_id: "sub-3", name: "Coordination Protocols & Leader Election", importance: "medium", is_completed: false, created_at: today.toISOString() },
  { id: "top-21", user_id: "demo-user", subject_id: "sub-3", name: "CPS Security & Attack Countermeasures", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-22", user_id: "demo-user", subject_id: "sub-3", name: "CPS Applications (Smart Grid, Healthcare, WSN)", importance: "medium", is_completed: false, created_at: today.toISOString() },

  // Ethical Hacking
  { id: "top-23", user_id: "demo-user", subject_id: "sub-4", name: "Cyber Ethics & Hacking Introduction", importance: "medium", is_completed: true, created_at: today.toISOString() },
  { id: "top-24", user_id: "demo-user", subject_id: "sub-4", name: "Information Gathering & Scanning", importance: "high", is_completed: true, created_at: today.toISOString() },
  { id: "top-25", user_id: "demo-user", subject_id: "sub-4", name: "Virus, Worms & Malware Analysis", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-26", user_id: "demo-user", subject_id: "sub-4", name: "Trojans, Backdoors & Sniffers", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-27", user_id: "demo-user", subject_id: "sub-4", name: "Social Engineering & Spoofing (Email, DNS, IP)", importance: "medium", is_completed: false, created_at: today.toISOString() },
  { id: "top-28", user_id: "demo-user", subject_id: "sub-4", name: "System Hacking & HoneyPots", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-29", user_id: "demo-user", subject_id: "sub-4", name: "Hacking Web Servers & SQL Injection", importance: "high", is_completed: false, created_at: today.toISOString() },
  { id: "top-30", user_id: "demo-user", subject_id: "sub-4", name: "Hacking Wireless Networks & Mobile Platforms", importance: "medium", is_completed: false, created_at: today.toISOString() },
];

export const demoTasks = [
  { id: "task-1", user_id: "demo-user", title: "Review Process Control (fork, vfork)", scheduled_date: format(today, "yyyy-MM-dd"), is_completed: true, completed_at: today.toISOString(), study_plan_id: null, topic_id: "top-5", created_at: today.toISOString() },
  { id: "task-2", user_id: "demo-user", title: "Practice Shell Scripting loops & conditionals", scheduled_date: format(today, "yyyy-MM-dd"), is_completed: false, completed_at: null, study_plan_id: null, topic_id: "top-8", created_at: today.toISOString() },
  { id: "task-3", user_id: "demo-user", title: "Study Modulation Techniques (ASK, PSK, FSK)", scheduled_date: format(today, "yyyy-MM-dd"), is_completed: false, completed_at: null, study_plan_id: null, topic_id: "top-12", created_at: today.toISOString() },
  { id: "task-4", user_id: "demo-user", title: "Read CPS Security & Attack Models", scheduled_date: format(today, "yyyy-MM-dd"), is_completed: false, completed_at: null, study_plan_id: null, topic_id: "top-21", created_at: today.toISOString() },
  { id: "task-5", user_id: "demo-user", title: "Revise SQL Injection & Web Hacking", scheduled_date: format(today, "yyyy-MM-dd"), is_completed: false, completed_at: null, study_plan_id: null, topic_id: "top-29", created_at: today.toISOString() },
];

export const demoFiles = [
  { id: "file-1", user_id: "demo-user", file_name: "Unix_Shell_Programming_Notes.pdf", file_url: "#", file_type: "application/pdf", file_size: 312000, subject_id: "sub-1", subjects: { name: "Unix & Shell Programming" }, created_at: today.toISOString() },
  { id: "file-2", user_id: "demo-user", file_name: "Wireless_Communication_Ch3.pdf", file_url: "#", file_type: "application/pdf", file_size: 485000, subject_id: "sub-2", subjects: { name: "Wireless Communication" }, created_at: today.toISOString() },
  { id: "file-3", user_id: "demo-user", file_name: "Ethical_Hacking_Lab_Manual.pdf", file_url: "#", file_type: "application/pdf", file_size: 620000, subject_id: "sub-4", subjects: { name: "Ethical Hacking" }, created_at: today.toISOString() },
];
