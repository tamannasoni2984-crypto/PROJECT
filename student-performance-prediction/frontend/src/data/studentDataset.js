// CSV Dataset records extracted from dataset/student_data.csv
export const STUDENT_DATASET = [
  {
    id: 1,
    student: 1,
    study_hours: 2,
    attendance: 65,
    previous_score: 55,
    assignment_completed: 60,
    sleep_hours: 6,
    extracurricular: 0,
    final_score: 52,
    category: "Average",
  },
  {
    id: 2,
    student: 2,
    study_hours: 3,
    attendance: 70,
    previous_score: 60,
    assignment_completed: 70,
    sleep_hours: 7,
    extracurricular: 0,
    final_score: 58,
    category: "Average",
  },
  {
    id: 3,
    student: 3,
    study_hours: 4,
    attendance: 75,
    previous_score: 65,
    assignment_completed: 80,
    sleep_hours: 7,
    extracurricular: 1,
    final_score: 66,
    category: "Good",
  },
  {
    id: 4,
    student: 4,
    study_hours: 5,
    attendance: 80,
    previous_score: 70,
    assignment_completed: 85,
    sleep_hours: 7,
    extracurricular: 1,
    final_score: 72,
    category: "Good",
  },
  {
    id: 5,
    student: 5,
    study_hours: 6,
    attendance: 85,
    previous_score: 75,
    assignment_completed: 90,
    sleep_hours: 8,
    extracurricular: 1,
    final_score: 80,
    category: "Excellent",
  },
  {
    id: 6,
    student: 6,
    study_hours: 7,
    attendance: 90,
    previous_score: 82,
    assignment_completed: 95,
    sleep_hours: 8,
    extracurricular: 1,
    final_score: 88,
    category: "Excellent",
  },
  {
    id: 7,
    student: 7,
    study_hours: 1,
    attendance: 60,
    previous_score: 45,
    assignment_completed: 50,
    sleep_hours: 5,
    extracurricular: 0,
    final_score: 42,
    category: "Average",
  },
  {
    id: 8,
    student: 8,
    study_hours: 2,
    attendance: 68,
    previous_score: 52,
    assignment_completed: 65,
    sleep_hours: 6,
    extracurricular: 0,
    final_score: 50,
    category: "Average",
  },
  {
    id: 9,
    student: 9,
    study_hours: 4,
    attendance: 78,
    previous_score: 68,
    assignment_completed: 75,
    sleep_hours: 7,
    extracurricular: 1,
    final_score: 67,
    category: "Good",
  },
  {
    id: 10,
    student: 10,
    study_hours: 5,
    attendance: 82,
    previous_score: 72,
    assignment_completed: 88,
    sleep_hours: 8,
    extracurricular: 1,
    final_score: 75,
    category: "Good",
  },
  {
    id: 11,
    student: 11,
    study_hours: 6,
    attendance: 88,
    previous_score: 78,
    assignment_completed: 92,
    sleep_hours: 8,
    extracurricular: 1,
    final_score: 83,
    category: "Excellent",
  },
  {
    id: 12,
    student: 12,
    study_hours: 8,
    attendance: 94,
    previous_score: 90,
    assignment_completed: 98,
    sleep_hours: 8,
    extracurricular: 1,
    final_score: 94,
    category: "Excellent",
  },
  {
    id: 13,
    student: 13,
    study_hours: 3,
    attendance: 72,
    previous_score: 58,
    assignment_completed: 72,
    sleep_hours: 6,
    extracurricular: 0,
    final_score: 57,
    category: "Average",
  },
  {
    id: 14,
    student: 14,
    study_hours: 4,
    attendance: 76,
    previous_score: 63,
    assignment_completed: 78,
    sleep_hours: 7,
    extracurricular: 0,
    final_score: 64,
    category: "Good",
  },
  {
    id: 15,
    student: 15,
    study_hours: 5,
    attendance: 84,
    previous_score: 74,
    assignment_completed: 86,
    sleep_hours: 7,
    extracurricular: 1,
    final_score: 76,
    category: "Good",
  },
  {
    id: 16,
    student: 16,
    study_hours: 7,
    attendance: 91,
    previous_score: 85,
    assignment_completed: 96,
    sleep_hours: 8,
    extracurricular: 1,
    final_score: 90,
    category: "Excellent",
  },
  {
    id: 17,
    student: 17,
    study_hours: 2,
    attendance: 64,
    previous_score: 48,
    assignment_completed: 55,
    sleep_hours: 6,
    extracurricular: 0,
    final_score: 47,
    category: "Average",
  },
  {
    id: 18,
    student: 18,
    study_hours: 3,
    attendance: 69,
    previous_score: 56,
    assignment_completed: 68,
    sleep_hours: 6,
    extracurricular: 0,
    final_score: 55,
    category: "Average",
  },
  {
    id: 19,
    student: 19,
    study_hours: 6,
    attendance: 86,
    previous_score: 80,
    assignment_completed: 91,
    sleep_hours: 8,
    extracurricular: 1,
    final_score: 84,
    category: "Excellent",
  },
  {
    id: 20,
    student: 20,
    study_hours: 8,
    attendance: 96,
    previous_score: 92,
    assignment_completed: 99,
    sleep_hours: 9,
    extracurricular: 1,
    final_score: 96,
    category: "Excellent",
  },
];

export function getRecommendationsForStudent(student) {
  const recommendations = [];

  if (Number(student.study_hours) < 4) {
    recommendations.push("Increase daily study hours to at least 4 hours.");
  } else {
    recommendations.push("Daily study routine is effective. Maintain this momentum.");
  }

  if (Number(student.attendance) < 75) {
    recommendations.push("Attendance is below 75%. Prioritize regular lecture attendance.");
  } else {
    recommendations.push("Great lecture attendance. Consistent participation pays off.");
  }

  if (Number(student.assignment_completed) < 75) {
    recommendations.push("Complete coursework and assignments on time to avoid grade loss.");
  } else {
    recommendations.push("Consistent assignment submission helps retain key subject concepts.");
  }

  if (Number(student.sleep_hours) < 7) {
    recommendations.push("Aim for 7–8 hours of restorative sleep to enhance cognitive focus.");
  } else {
    recommendations.push("Healthy sleep habits support sustained memory and learning.");
  }

  if (Number(student.extracurricular) === 1) {
    recommendations.push("Active extracurricular involvement develops balanced soft skills.");
  } else {
    recommendations.push("Consider participating in clubs or activities for well-rounded growth.");
  }

  return recommendations;
}
