export const steps = [
  { title: "Select an Industry" },
  { title: "Select a Job Role" },
  { title: "Interview Type" },
  { title: "Experience Level" },
  { title: "Company Name" },
  { title: "Job Description" },
  { title: "Customize" },
];

export const industry = [
  { key: "SI", value: "Software Industry" },
  { key: "ET", value: "Education" },
  { key: "RS", value: "Retail Services" },
  { key: "HT", value: "Hospitality / Tourism" },
  { key: "HS", value: "Health Science" },
].sort((a, b) => a.value.localeCompare(b.value));

export const jobRole = {
  "Software Industry": [
    { key: "ai", value: "AI Engineer" },
    { key: "backend_developer", value: "Backend Developer" },
    { key: "business_analyst", value: "Business Analyst" },
    { key: "cloud_engineer", value: "Cloud Engineer" },
    { key: "cybersecurity_analyst", value: "Cybersecurity Analyst" },
    { key: "data_scientist", value: "Data Scientist" },
    { key: "database_admin", value: "Database Administrator" },
    { key: "devops_engineer", value: "DevOps Engineer" },
    { key: "frontend_developer", value: "Frontend Developer" },
    { key: "fullstack_developer", value: "Full Stack Developer" },
    { key: "machine_learning_engineer", value: "Machine Learning Engineer" },
    { key: "mobile_app_developer", value: "Mobile App Developer" },
    { key: "network_admin", value: "Network Administrator" },
    { key: "product_manager", value: "Product Manager" },
    { key: "qa_engineer", value: "QA Tester/Engineer" },
    { key: "software_engineer", value: "Software Engineer" },
    { key: "software_architect", value: "Software Architect" },
    { key: "ui_ux_designer", value: "UI/UX Designer" },
    { key: "web_developer", value: "Web Developer" },
  ],
  "Retail Services": [
    { key: "assistant_store_manager", value: "Assistant Store Manager" },
    { key: "call_center_agent", value: "Call Center Agent" },
    { key: "cashier", value: "Cashier" },
    {
      key: "customer_service_representative",
      value: "Customer Service Representative",
    },
    { key: "department_manager", value: "Department Manager" },
    { key: "inventory_associate", value: "Inventory Associate" },
    {
      key: "inventory_control_specialist",
      value: "Inventory Control Specialist",
    },
    { key: "sales_associate", value: "Sales Associate" },
    { key: "warehouse_clerk", value: "Warehouse Clerk" },
  ],
  "Education": [
    { key: "instructor", value: "Instructor" },
    { key: "librarian", value: "Librarian" },
    { key: "middle_school_teacher", value: "Middle School Teacher" },
    { key: "preschool_teacher", value: "Preschool Teacher" },
    { key: "professor", value: "Professor" },
    { key: "teaching_assistant", value: "Teaching Assistant" },
  ],
  "Hospitality / Tourism": [
    { key: "bartender", value: "Bartender" },
    { key: "event_planner", value: "Event Planner" },
    { key: "font_desk_associate", value: "Font Desk Associate" },
    { key: "guest_service_associate", value: "Guest Service Associate"},
    { key: "housekeeper", value: "Housekeeper" },
    { key: "hotel_manager", value: "Hotel Manager" },
    { key: "receptionist", value: "Receptionist" },
    { key: "tour_guide", value: "Tour Guide" },
    { key: "travel_consultant", value: "Travel Consultant" },
    { key: "waitress", value: "Waitress" },
  ],
  "Health Science": [
    { key: "doctor", value: "Doctor" },
    { key: "health_educator", value: "Health Educator" },
    { key: "hospitalist", value: "Hospitalist" },
    { key: "laboratory_assistant", value: "Laboratory Assistant" },
    { key: "mental_health_counselor", value: "Mental Health Counselor" },
    { key: "nurse", value: "Nurse" },
    { key: "orthodontist", value: "Orthodontist" },
    { key: "pharmacist", value: "Pharmacist" },
    { key: "physician_assistant", value: "Physician Assistant" },
    { key: "psychiatrist", value: "Psychiatrist" },
    { key: "psychologist", value: "Psychologist" },
  ],
};

Object.keys(jobRole).forEach((category) => {
  jobRole[category] = jobRole[category].sort((a, b) =>
    a.value.localeCompare(b.value)
  );
});

export const experienceLevel = [
  { key: "entry_level", value: "Entry-Level (0-2 Years)" },
  { key: "mid_level", value: "Mid-Level (3-7 Years)" },
  { key: "senior_level", value: "Senior-Level (8+ Years)" },
];
