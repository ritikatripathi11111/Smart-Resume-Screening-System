import mammoth from "mammoth";

const SKILLS = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "MongoDB",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "HTML",
  "CSS",
  "Tailwind",
  "Git",
  "GitHub",
  "Docker",
  "AWS",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
];

export async function extractResumeData(file: File) {
  const name = file.name.replace(/\.[^/.]+$/, "");

  return {
    name,
    email: "candidate@email.com",
    phone: "9999999999",
    location: "India",
    job_title: "Software Developer",
    current_company: "N/A",
    years_experience: 1,
    education: "B.Tech CSE",
    skills: ["Python", "JavaScript", "React"],
    confidence: 95,
    rawText: name,
  };
}