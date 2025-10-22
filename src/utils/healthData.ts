export interface HealthParameter {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'warning' | 'critical';
  recentChange?: 'improved' | 'declined' | 'stable';
  timestamp: string;
}

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  currentStatus: 'controlled' | 'uncontrolled' | 'in-remission';
  relatedParameters: string[];
  treatment?: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'test' | 'diagnosis' | 'treatment' | 'medication' | 'appointment';
  parameters?: HealthParameter[];
  related?: string[];
  status: 'completed' | 'pending' | 'missed';
  highlight?: boolean;
}

export interface DiagnosticNode {
  id: string;
  date: string;
  title: string;
  description: string;
  parameters: HealthParameter[];
  x: number;
  y: number;
  connections: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: { value: number; unit: string };
  weight: { value: number; unit: string };
  bmi: number;
  bloodType: string;
  emergencyContact: string;
  allergies: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
  }[];
}

export const userProfile: UserProfile = {
  id: "user-001",
  name: "Rajesh Kumar",
  age: 28,
  gender: "Male",
  height: { value: 175, unit: "cm" },
  weight: { value: 78, unit: "kg" },
  bmi: 25.5,
  bloodType: "O+",
  emergencyContact: "+91 98765 43210",
  allergies: ["Peanuts", "Shellfish"],
  medications: [
    {
      name: "Cetrizine",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2023-01-15"
    },
    {
      name: "Montelukast",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2022-11-20"
    }
  ]
};

export const healthParameters: HealthParameter[] = [
  {
    id: "param-001",
    name: "Blood Glucose",
    value: 125,
    unit: "mg/dL",
    status: "warning",
    recentChange: "improved",
    timestamp: "2023-09-15T08:30:00Z"
  },
  {
    id: "param-002",
    name: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    status: "normal",
    recentChange: "stable",
    timestamp: "2023-09-15T08:30:00Z"
  },
  {
    id: "param-003",
    name: "HbA1c",
    value: 6.2,
    unit: "%",
    status: "warning",
    recentChange: "improved",
    timestamp: "2023-09-01T10:15:00Z"
  },
  {
    id: "param-004",
    name: "Total Cholesterol",
    value: 195,
    unit: "mg/dL",
    status: "normal",
    recentChange: "improved",
    timestamp: "2023-09-01T10:15:00Z"
  },
  {
    id: "param-005",
    name: "HDL Cholesterol",
    value: 45,
    unit: "mg/dL",
    status: "normal",
    recentChange: "stable",
    timestamp: "2023-09-01T10:15:00Z"
  },
  {
    id: "param-006",
    name: "LDL Cholesterol",
    value: 130,
    unit: "mg/dL",
    status: "warning",
    recentChange: "declined",
    timestamp: "2023-09-01T10:15:00Z"
  },
  {
    id: "param-007",
    name: "Triglycerides",
    value: 150,
    unit: "mg/dL",
    status: "normal",
    recentChange: "stable",
    timestamp: "2023-09-01T10:15:00Z"
  },
  {
    id: "param-008",
    name: "eGFR",
    value: 85,
    unit: "mL/min",
    status: "normal",
    recentChange: "stable",
    timestamp: "2023-08-20T14:30:00Z"
  }
];

export const chronicConditions: ChronicCondition[] = [
  {
    id: "cond-001",
    name: "Type 2 Diabetes",
    diagnosedDate: "2020-03-15",
    severity: "moderate",
    currentStatus: "controlled",
    relatedParameters: ["param-001", "param-003"]
  },
  {
    id: "cond-002",
    name: "Hypertension",
    diagnosedDate: "2019-11-20",
    severity: "mild",
    currentStatus: "controlled",
    relatedParameters: ["param-002"]
  },
  {
    id: "cond-003",
    name: "Hyperlipidemia",
    diagnosedDate: "2021-05-10",
    severity: "mild",
    currentStatus: "controlled",
    relatedParameters: ["param-004", "param-005", "param-006", "param-007"]
  }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "event-001",
    date: "2023-09-15",
    title: "Routine Check-up",
    description: "Regular quarterly check-up with Dr. Smith",
    type: "appointment",
    parameters: [
      healthParameters[0],
      healthParameters[1]
    ],
    status: "completed",
    highlight: false
  },
  {
    id: "event-002",
    date: "2023-09-01",
    title: "Lab Tests",
    description: "Comprehensive blood panel including HbA1c and lipid profile",
    type: "test",
    parameters: [
      healthParameters[2],
      healthParameters[3],
      healthParameters[4],
      healthParameters[5],
      healthParameters[6]
    ],
    status: "completed",
    highlight: true
  },
  {
    id: "event-003",
    date: "2023-08-20",
    title: "Kidney Function Test",
    description: "Annual kidney function assessment",
    type: "test",
    parameters: [
      healthParameters[7]
    ],
    status: "completed",
    highlight: false
  },
  {
    id: "event-004",
    date: "2023-07-10",
    title: "Medication Adjustment",
    description: "Metformin dosage adjusted to 500mg twice daily",
    type: "medication",
    related: ["cond-001"],
    status: "completed",
    highlight: true
  },
  {
    id: "event-005",
    date: "2023-06-15",
    title: "Dietitian Consultation",
    description: "Review of meal plan and dietary recommendations",
    type: "appointment",
    related: ["cond-001", "cond-03"],
    status: "completed",
    highlight: false
  },
  {
    id: "event-006",
    date: "2023-05-20",
    title: "Ophthalmology Exam",
    description: "Annual eye examination for diabetic retinopathy",
    type: "test",
    related: ["cond-001"],
    status: "completed",
    highlight: false
  },
  {
    id: "event-007",
    date: "2023-10-15",
    title: "Upcoming Quarterly Check-up",
    description: "Regular check-up with Dr. Smith",
    type: "appointment",
    status: "pending",
    highlight: true
  }
];

export const diabetesProgressionNodes: DiagnosticNode[] = [
  {
    id: "initial",
    date: new Date().toISOString(),
    title: "Initial",
    description: "Starting point of diagnosis",
    parameters: [],
    x: 3,
    y: 0,
    connections: ["male", "female"]
  },
  {
    id: "male",
    date: new Date().toISOString(),
    title: "Male",
    description: "Male patient group",
    parameters: [
      {
        id: "gender-m",
        name: "Gender",
        value: "Male",
        status: "normal",
        timestamp: new Date().toISOString()
      }
    ],
    x: 1,
    y: 1,
    connections: ["pre_appendicitis"]
  },
  {
    id: "female",
    date: new Date().toISOString(),
    title: "Female",
    description: "Female patient group",
    parameters: [
      {
        id: "gender-f",
        name: "Gender",
        value: "Female",
        status: "normal",
        timestamp: new Date().toISOString()
      }
    ],
    x: 5,
    y: 1,
    connections: ["pre_appendicitis"]
  },
  {
    id: "pre_appendicitis",
    date: new Date().toISOString(),
    title: "Pre-appendicitis",
    description: "Initial appendicitis assessment",
    parameters: [
      {
        id: "probability",
        name: "Probability",
        value: "Male: 8.6%, Female: 6.7%",
        status: "warning",
        timestamp: new Date().toISOString()
      }
    ],
    x: 3,
    y: 2,
    connections: ["age_65_plus", "age_1_17", "age_18_44", "age_45_64"]
  },
  {
    id: "age_65_plus",
    date: new Date().toISOString(),
    title: "Ages 65+",
    description: "Elderly age group (65-99 years)",
    parameters: [
      {
        id: "age-range",
        name: "Age Range",
        value: "65-99 years",
        status: "warning",
        timestamp: new Date().toISOString()
      },
      {
        id: "probability",
        name: "Probability",
        value: "9.3%",
        status: "warning",
        timestamp: new Date().toISOString()
      }
    ],
    x: 1,
    y: 3,
    connections: ["appendicitis_symptom"]
  },
  {
    id: "age_1_17",
    date: new Date().toISOString(),
    title: "Ages 1-17",
    description: "Pediatric age group",
    parameters: [
      {
        id: "age-range",
        name: "Age Range",
        value: "1-17 years",
        status: "normal",
        timestamp: new Date().toISOString()
      },
      {
        id: "probability",
        name: "Probability",
        value: "26.3%",
        status: "warning",
        timestamp: new Date().toISOString()
      }
    ],
    x: 2,
    y: 3,
    connections: ["appendicitis_symptom"]
  },
  {
    id: "age_18_44",
    date: new Date().toISOString(),
    title: "Ages 18-44",
    description: "Young adult age group",
    parameters: [
      {
        id: "age-range",
        name: "Age Range",
        value: "18-44 years",
        status: "normal",
        timestamp: new Date().toISOString()
      },
      {
        id: "probability",
        name: "Probability",
        value: "42.3%",
        status: "warning",
        timestamp: new Date().toISOString()
      }
    ],
    x: 4,
    y: 3,
    connections: ["appendicitis_symptom"]
  },
  {
    id: "age_45_64",
    date: new Date().toISOString(),
    title: "Ages 45-64",
    description: "Middle-age adult group",
    parameters: [
      {
        id: "age-range",
        name: "Age Range",
        value: "45-64 years",
        status: "normal",
        timestamp: new Date().toISOString()
      },
      {
        id: "probability",
        name: "Probability",
        value: "22.1%",
        status: "warning",
        timestamp: new Date().toISOString()
      }
    ],
    x: 5,
    y: 3,
    connections: ["appendicitis_symptom"]
  },
  {
    id: "appendicitis_symptom",
    date: new Date().toISOString(),
    title: "Appendicitis Symptom",
    description: "Primary symptom assessment",
    parameters: [
      {
        id: "pain-level",
        name: "Abdominal Pain",
        value: "50-100",
        unit: "severity scale",
        status: "critical",
        timestamp: new Date().toISOString()
      }
    ],
    x: 3,
    y: 4,
    connections: []
  }
];

export const generateUserSpecificNodes = (user: UserProfile, condition: ChronicCondition): DiagnosticNode[] => {
  if (condition.name.toLowerCase().includes("allergy") || condition.id === "cond-001") {
    return generateFoodAllergyNodes(user);
  } else if (condition.name.toLowerCase().includes("hypertension") || condition.id === "cond-002") {
    return generateHypertensionNodes(user);
  } else if (condition.name.toLowerCase().includes("lipid") || condition.id === "cond-003") {
    return generateHyperlipidemiaNotes(user);
  } else {
    return generateDiabeticNodes(user);
  }
};

const generateFoodAllergyNodes = (user: UserProfile): DiagnosticNode[] => {
  const currentDate = new Date().toISOString();
  const nodes: DiagnosticNode[] = [];

  nodes.push({
    id: "moderate_reaction",
    date: currentDate,
    title: "Moderate_Reaction_To_Food",
    description: "Patient presents with moderate allergic reaction to food",
    parameters: [
      {
        id: "severity",
        name: "Severity",
        value: "Simple",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 1,
    y: 0,
    connections: ["delay_for_pcp"]
  });

  nodes.push({
    id: "severe_reaction",
    date: currentDate,
    title: "Severe_Reaction_To_Food",
    description: "Patient presents with severe allergic reaction to food",
    parameters: [
      {
        id: "callsubmodule",
        name: "CallSubmodule",
        value: "Call submodule 'allergies/severe_allergic_reaction'",
        status: "critical",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 0,
    connections: ["delay_for_pcp"]
  });

  nodes.push({
    id: "delay_for_pcp",
    date: currentDate,
    title: "Delay_For_PCP_Visit",
    description: "Wait period before PCP visit",
    parameters: [
      {
        id: "delay",
        name: "Delay",
        value: "0 - 1 days",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 1,
    connections: ["pcp_visit"]
  });

  nodes.push({
    id: "pcp_visit",
    date: currentDate,
    title: "PCP_Visit_For_Food_Allergy",
    description: "Primary care visit for food allergy evaluation",
    parameters: [
      {
        id: "encounter",
        name: "Encounter",
        value: "SNOMED-CT[185347001]: Encounter for problem",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 2,
    connections: ["food_allergy_careplan", "attribute_check"]
  });

  nodes.push({
    id: "attribute_check",
    date: currentDate,
    title: "1. Attribute: 'food_allergy_careplan' is nil",
    description: "Check if food allergy care plan exists",
    parameters: [],
    x: 5,
    y: 3,
    connections: ["living_with_food_allergies"]
  });

  nodes.push({
    id: "food_allergy_careplan",
    date: currentDate,
    title: "Food_Allergy_CarePlan",
    description: "Care plan for managing food allergies",
    parameters: [
      {
        id: "careplan-start",
        name: "CarePlanStart",
        value: "",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "snomed-code",
        name: "SNOMED-CT[326051000000105]",
        value: "Self care",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "activities",
        name: "Activities",
        value: "SNOMED-CT[409002]: Food allergy diet\nSNOMED-CT[58332002]: Allergy education",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 2,
    y: 3,
    connections: ["advise_allergist"]
  });

  nodes.push({
    id: "advise_allergist",
    date: currentDate,
    title: "Advise_To_Visit_Allergist",
    description: "Recommendation for allergist consultation",
    parameters: [
      {
        id: "setattribute",
        name: "SetAttribute",
        value: "Set 'visit_allergist' = 'true'",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: user.age < 20 ? "10%" : "2%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 2,
    y: 4,
    connections: ["end_pcp_visit"]
  });

  nodes.push({
    id: "end_pcp_visit",
    date: currentDate,
    title: "End_PCP_Visit_For_Food_Allergy",
    description: "Conclusion of primary care visit",
    parameters: [
      {
        id: "encounterend",
        name: "EncounterEnd",
        value: "End the current encounter",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 2,
    y: 5,
    connections: ["living_with_food_allergies"]
  });

  nodes.push({
    id: "living_with_food_allergies",
    date: currentDate,
    title: "Living_With_Food_Allergies",
    description: "Long-term management of food allergies",
    parameters: [
      {
        id: "delay",
        name: "Delay",
        value: "12 - 24 months",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 6,
    connections: ["potential_allergic_reaction", "potential_outgrow", "age_check"]
  });

  nodes.push({
    id: "age_check",
    date: currentDate,
    title: "1. age > 16 years and Attribute: 'outgrew_food_allergies' is nil",
    description: "Check if patient is old enough to potentially outgrow allergies",
    parameters: [],
    x: 5,
    y: 7,
    connections: ["potential_outgrow"]
  });

  nodes.push({
    id: "potential_outgrow",
    date: currentDate,
    title: "Potential_To_Outgrow_Allergies",
    description: "Assessment for potential to outgrow food allergies",
    parameters: [
      {
        id: "callsubmodule",
        name: "CallSubmodule",
        value: "Call submodule 'allergies/outgrow_food_allergies'",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 8,
    connections: ["outgrew_check"]
  });

  nodes.push({
    id: "outgrew_check",
    date: currentDate,
    title: "1. Attribute: 'outgrew_food_allergies' == true",
    description: "Check if patient has outgrown their food allergies",
    parameters: [],
    x: 6,
    y: 9,
    connections: ["terminal"]
  });

  nodes.push({
    id: "terminal",
    date: currentDate,
    title: "Terminal",
    description: "End of pathway",
    parameters: [],
    x: 7,
    y: 10,
    connections: []
  });

  nodes.push({
    id: "potential_allergic_reaction",
    date: currentDate,
    title: "Potential_Allergic_Reaction_To_Food",
    description: "Risk assessment for future allergic reactions",
    parameters: [
      {
        id: "simple",
        name: "Simple",
        value: "",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: user.age < 20 ? "90%" : "98%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 1,
    y: 10,
    connections: []
  });

  return nodes;
};

const generateHypertensionNodes = (user: UserProfile): DiagnosticNode[] => {
  const currentDate = new Date().toISOString();
  const nodes: DiagnosticNode[] = [];

  nodes.push({
    id: "initial_bp_reading",
    date: currentDate,
    title: "Initial BP Reading",
    description: "First blood pressure measurement",
    parameters: [
      {
        id: "systolic",
        name: "Systolic",
        value: "145",
        unit: "mmHg",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "diastolic",
        name: "Diastolic",
        value: "95",
        unit: "mmHg",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 0,
    connections: ["bp_classification"]
  });

  nodes.push({
    id: "bp_classification",
    date: currentDate,
    title: "BP Classification",
    description: "Classification of blood pressure reading",
    parameters: [
      {
        id: "category",
        name: "Category",
        value: "Stage 1 Hypertension",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 1,
    connections: ["risk_assessment", "lifestyle_modification"]
  });

  nodes.push({
    id: "risk_assessment",
    date: currentDate,
    title: "Risk Assessment",
    description: "Cardiovascular risk assessment",
    parameters: [
      {
        id: "risk-level",
        name: "Risk Level",
        value: user.age > 50 ? "High" : "Moderate",
        status: user.age > 50 ? "critical" : "warning",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 2,
    connections: ["medication_decision"]
  });

  nodes.push({
    id: "lifestyle_modification",
    date: currentDate,
    title: "Lifestyle Modification",
    description: "Non-pharmacological interventions",
    parameters: [
      {
        id: "interventions",
        name: "Interventions",
        value: "DASH Diet, Exercise, Salt Reduction",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 1,
    y: 2,
    connections: ["follow_up_1_month"]
  });

  nodes.push({
    id: "follow_up_1_month",
    date: currentDate,
    title: "Follow-up (1 month)",
    description: "First follow-up visit after initial assessment",
    parameters: [
      {
        id: "bp-reading",
        name: "BP Reading",
        value: "138/88",
        unit: "mmHg",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 1,
    y: 3,
    connections: ["medication_decision"]
  });

  nodes.push({
    id: "medication_decision",
    date: currentDate,
    title: "Medication Decision",
    description: "Decision point for antihypertensive medication",
    parameters: [
      {
        id: "decision",
        name: "Decision",
        value: "Initiate medication",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 4,
    connections: ["medication_selection"]
  });

  nodes.push({
    id: "medication_selection",
    date: currentDate,
    title: "Medication Selection",
    description: "Selection of appropriate antihypertensive agent",
    parameters: [
      {
        id: "first-line",
        name: "First-line",
        value: user.age > 55 ? "Calcium Channel Blocker" : "ACE Inhibitor",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 5,
    connections: ["follow_up_3_months"]
  });

  nodes.push({
    id: "follow_up_3_months",
    date: currentDate,
    title: "Follow-up (3 months)",
    description: "Evaluation of treatment response",
    parameters: [
      {
        id: "bp-reading",
        name: "BP Reading",
        value: "132/84",
        unit: "mmHg",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 6,
    connections: ["bp_target_achieved", "bp_target_not_achieved"]
  });

  nodes.push({
    id: "bp_target_achieved",
    date: currentDate,
    title: "BP Target Achieved",
    description: "Blood pressure controlled",
    parameters: [
      {
        id: "status",
        name: "Status",
        value: "Controlled",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "65%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 2,
    y: 7,
    connections: ["long_term_management"]
  });

  nodes.push({
    id: "bp_target_not_achieved",
    date: currentDate,
    title: "BP Target Not Achieved",
    description: "Blood pressure still elevated",
    parameters: [
      {
        id: "status",
        name: "Status",
        value: "Uncontrolled",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "35%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 7,
    connections: ["combination_therapy"]
  });

  nodes.push({
    id: "combination_therapy",
    date: currentDate,
    title: "Combination Therapy",
    description: "Multiple medication approach",
    parameters: [
      {
        id: "regimen",
        name: "Regimen",
        value: "ACE-I + CCB or Diuretic",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 8,
    connections: ["follow_up_6_months"]
  });

  nodes.push({
    id: "follow_up_6_months",
    date: currentDate,
    title: "Follow-up (6 months)",
    description: "Evaluation of combination therapy",
    parameters: [
      {
        id: "bp-reading",
        name: "BP Reading",
        value: "128/82",
        unit: "mmHg",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 9,
    connections: ["long_term_management"]
  });

  nodes.push({
    id: "long_term_management",
    date: currentDate,
    title: "Long-term Management",
    description: "Ongoing hypertension management",
    parameters: [
      {
        id: "follow-up",
        name: "Follow-up",
        value: "Every 6 months",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 10,
    connections: []
  });

  return nodes;
};

const generateHyperlipidemiaNotes = (user: UserProfile): DiagnosticNode[] => {
  const currentDate = new Date().toISOString();
  const nodes: DiagnosticNode[] = [];

  nodes.push({
    id: "initial_lipid_panel",
    date: currentDate,
    title: "Initial Lipid Panel",
    description: "Baseline lipid measurements",
    parameters: [
      {
        id: "total-chol",
        name: "Total Cholesterol",
        value: "240",
        unit: "mg/dL",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "ldl",
        name: "LDL",
        value: "160",
        unit: "mg/dL",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "hdl",
        name: "HDL",
        value: "45",
        unit: "mg/dL",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 0,
    connections: ["risk_stratification"]
  });

  nodes.push({
    id: "risk_stratification",
    date: currentDate,
    title: "ASCVD Risk Stratification",
    description: "10-year atherosclerotic cardiovascular disease risk assessment",
    parameters: [
      {
        id: "risk-score",
        name: "10-year Risk",
        value: user.age > 50 ? "15.2%" : "7.8%",
        status: user.age > 50 ? "critical" : "warning",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 1,
    connections: ["high_risk", "moderate_risk", "low_risk"]
  });

  nodes.push({
    id: "high_risk",
    date: currentDate,
    title: "High Risk",
    description: "ASCVD risk ≥ 7.5%",
    parameters: [
      {
        id: "pathway",
        name: "Treatment Pathway",
        value: "High-intensity statin",
        status: "critical",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "30%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 2,
    connections: ["statin_therapy"]
  });

  nodes.push({
    id: "moderate_risk",
    date: currentDate,
    title: "Moderate Risk",
    description: "ASCVD risk 5% to < 7.5%",
    parameters: [
      {
        id: "pathway",
        name: "Treatment Pathway",
        value: "Moderate-intensity statin",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "40%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 2,
    connections: ["statin_therapy"]
  });

  nodes.push({
    id: "low_risk",
    date: currentDate,
    title: "Low Risk",
    description: "ASCVD risk < 5%",
    parameters: [
      {
        id: "pathway",
        name: "Treatment Pathway",
        value: "Lifestyle modifications",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "30%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 1,
    y: 2,
    connections: ["lifestyle_interventions"]
  });

  nodes.push({
    id: "lifestyle_interventions",
    date: currentDate,
    title: "Lifestyle Interventions",
    description: "Non-pharmacological management",
    parameters: [
      {
        id: "diet",
        name: "Diet",
        value: "Mediterranean diet, reduced saturated fat",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "exercise",
        name: "Exercise",
        value: "150 min/week moderate activity",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 1,
    y: 3,
    connections: ["follow_up_3_months"]
  });

  nodes.push({
    id: "statin_therapy",
    date: currentDate,
    title: "Statin Therapy",
    description: "Pharmacological management with statins",
    parameters: [
      {
        id: "medication",
        name: "Medication",
        value: user.age > 50 ? "Atorvastatin 40mg daily" : "Rosuvastatin 10mg daily",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 3,
    connections: ["monitor_liver_function", "follow_up_3_months"]
  });

  nodes.push({
    id: "monitor_liver_function",
    date: currentDate,
    title: "Monitor Liver Function",
    description: "Baseline and follow-up liver function tests",
    parameters: [
      {
        id: "test",
        name: "Tests",
        value: "ALT, AST at baseline and 3 months",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 4,
    connections: ["statin_side_effects"]
  });

  nodes.push({
    id: "statin_side_effects",
    date: currentDate,
    title: "Assess Side Effects",
    description: "Evaluation for statin-associated symptoms",
    parameters: [
      {
        id: "symptoms",
        name: "Symptoms",
        value: "Myalgia, elevated LFTs",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "5-10%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 5,
    connections: ["alternate_statin", "follow_up_3_months"]
  });

  nodes.push({
    id: "alternate_statin",
    date: currentDate,
    title: "Alternate Statin",
    description: "Switch to different statin if side effects occur",
    parameters: [
      {
        id: "alternate",
        name: "Alternative",
        value: "Pravastatin or lower dose of current statin",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "8%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 6,
    y: 6,
    connections: ["follow_up_3_months"]
  });

  nodes.push({
    id: "follow_up_3_months",
    date: currentDate,
    title: "Follow-up (3 months)",
    description: "First follow-up lipid panel",
    parameters: [
      {
        id: "ldl-reduction",
        name: "LDL Reduction",
        value: "30-50%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 7,
    connections: ["ldl_target_achieved", "ldl_target_not_achieved"]
  });

  nodes.push({
    id: "ldl_target_achieved",
    date: currentDate,
    title: "LDL Target Achieved",
    description: "LDL goal reached based on risk category",
    parameters: [
      {
        id: "status",
        name: "Status",
        value: "Controlled",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "70%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 2,
    y: 8,
    connections: ["annual_monitoring"]
  });

  nodes.push({
    id: "ldl_target_not_achieved",
    date: currentDate,
    title: "LDL Target Not Achieved",
    description: "LDL remains above goal",
    parameters: [
      {
        id: "status",
        name: "Status",
        value: "Uncontrolled",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "30%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 8,
    connections: ["adjunctive_therapy"]
  });

  nodes.push({
    id: "adjunctive_therapy",
    date: currentDate,
    title: "Adjunctive Therapy",
    description: "Additional lipid-lowering treatment",
    parameters: [
      {
        id: "option",
        name: "Options",
        value: "Ezetimibe, PCSK9 inhibitor",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 9,
    connections: ["follow_up_6_months"]
  });

  nodes.push({
    id: "follow_up_6_months",
    date: currentDate,
    title: "Follow-up (6 months)",
    description: "Evaluation of adjunctive therapy",
    parameters: [
      {
        id: "ldl-reduction",
        name: "Additional LDL Reduction",
        value: "15-25%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 10,
    connections: ["annual_monitoring"]
  });

  nodes.push({
    id: "annual_monitoring",
    date: currentDate,
    title: "Annual Monitoring",
    description: "Long-term lipid management",
    parameters: [
      {
        id: "frequency",
        name: "Frequency",
        value: "Yearly lipid panel",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 11,
    connections: []
  });

  return nodes;
};

const generateDiabeticNodes = (user: UserProfile): DiagnosticNode[] => {
  const currentDate = new Date().toISOString();
  const nodes: DiagnosticNode[] = [];

  nodes.push({
    id: "initial_diagnosis",
    date: currentDate,
    title: "Initial Diagnosis",
    description: "Diagnosis of Type 2 Diabetes",
    parameters: [
      {
        id: "hba1c",
        name: "HbA1c",
        value: "7.8",
        unit: "%",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "fasting-glucose",
        name: "Fasting Glucose",
        value: "145",
        unit: "mg/dL",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 0,
    connections: ["initial_management"]
  });

  nodes.push({
    id: "initial_management",
    date: currentDate,
    title: "Initial Management",
    description: "First-line approach to diabetes management",
    parameters: [
      {
        id: "approach",
        name: "Approach",
        value: "Lifestyle + Metformin",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 1,
    connections: ["lifestyle_modification", "metformin_initiation"]
  });

  nodes.push({
    id: "lifestyle_modification",
    date: currentDate,
    title: "Lifestyle Modification",
    description: "Non-pharmacological interventions",
    parameters: [
      {
        id: "diet",
        name: "Diet",
        value: "Carbohydrate control, reduced calories",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "exercise",
        name: "Exercise",
        value: "150 min/week moderate activity",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 1,
    y: 2,
    connections: ["follow_up_3_months"]
  });

  nodes.push({
    id: "metformin_initiation",
    date: currentDate,
    title: "Metformin Initiation",
    description: "First-line pharmacological therapy",
    parameters: [
      {
        id: "dosage",
        name: "Dosage",
        value: "Start 500mg once daily, titrate to 1000mg twice daily",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 2,
    connections: ["gi_side_effects", "follow_up_3_months"]
  });

  nodes.push({
    id: "gi_side_effects",
    date: currentDate,
    title: "GI Side Effects",
    description: "Management of metformin-related GI issues",
    parameters: [
      {
        id: "symptoms",
        name: "Symptoms",
        value: "Nausea, diarrhea, abdominal discomfort",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "20-30%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 6,
    y: 3,
    connections: ["metformin_extended_release"]
  });

  nodes.push({
    id: "metformin_extended_release",
    date: currentDate,
    title: "Metformin Extended Release",
    description: "Alternative formulation to reduce side effects",
    parameters: [
      {
        id: "dosage",
        name: "Dosage",
        value: "500-2000mg once daily with evening meal",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 6,
    y: 4,
    connections: ["follow_up_3_months"]
  });

  nodes.push({
    id: "follow_up_3_months",
    date: currentDate,
    title: "Follow-up (3 months)",
    description: "First follow-up after initial management",
    parameters: [
      {
        id: "hba1c",
        name: "HbA1c",
        value: "7.1",
        unit: "%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 5,
    connections: ["target_achieved", "target_not_achieved"]
  });

  nodes.push({
    id: "target_achieved",
    date: currentDate,
    title: "Target Achieved",
    description: "HbA1c goal reached (< 7.0%)",
    parameters: [
      {
        id: "status",
        name: "Status",
        value: "Controlled",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "40%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 2,
    y: 6,
    connections: ["maintenance_therapy"]
  });

  nodes.push({
    id: "target_not_achieved",
    date: currentDate,
    title: "Target Not Achieved",
    description: "HbA1c remains above goal",
    parameters: [
      {
        id: "status",
        name: "Status",
        value: "Uncontrolled",
        status: "warning",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "60%",
        status: "warning",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 6,
    connections: ["dual_therapy"]
  });

  nodes.push({
    id: "dual_therapy",
    date: currentDate,
    title: "Dual Therapy",
    description: "Addition of second agent",
    parameters: [
      {
        id: "options",
        name: "Options",
        value: "SGLT2i, GLP-1 RA, DPP-4i, SU, TZD",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 7,
    connections: ["comorbidity_assessment"]
  });

  nodes.push({
    id: "comorbidity_assessment",
    date: currentDate,
    title: "Comorbidity Assessment",
    description: "Evaluation of diabetes-related comorbidities",
    parameters: [
      {
        id: "comorbidity-presence",
        name: "Presence of",
        value: "ASCVD, HF, CKD",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 4,
    y: 8,
    connections: ["ascvd_path", "no_ascvd_path"]
  });

  nodes.push({
    id: "ascvd_path",
    date: currentDate,
    title: "ASCVD Path",
    description: "Management with atherosclerotic cardiovascular disease",
    parameters: [
      {
        id: "preferred",
        name: "Preferred Agent",
        value: "GLP-1 RA or SGLT2i with proven CV benefit",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "35%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 5,
    y: 9,
    connections: ["follow_up_6_months"]
  });

  nodes.push({
    id: "no_ascvd_path",
    date: currentDate,
    title: "No ASCVD Path",
    description: "Management without established cardiovascular disease",
    parameters: [
      {
        id: "preferred",
        name: "Preferred Agent",
        value: "Based on cost, side effects, patient preference",
        status: "normal",
        timestamp: currentDate
      },
      {
        id: "probability",
        name: "Probability",
        value: "65%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 9,
    connections: ["follow_up_6_months"]
  });

  nodes.push({
    id: "maintenance_therapy",
    date: currentDate,
    title: "Maintenance Therapy",
    description: "Continued therapy with regular monitoring",
    parameters: [
      {
        id: "monitoring",
        name: "Monitoring",
        value: "HbA1c every 3-6 months",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 2,
    y: 10,
    connections: ["follow_up_6_months"]
  });

  nodes.push({
    id: "follow_up_6_months",
    date: currentDate,
    title: "Follow-up (6 months)",
    description: "Comprehensive diabetes follow-up",
    parameters: [
      {
        id: "hba1c",
        name: "HbA1c",
        value: "6.8",
        unit: "%",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 11,
    connections: ["annual_complications_screening"]
  });

  nodes.push({
    id: "annual_complications_screening",
    date: currentDate,
    title: "Annual Complications Screening",
    description: "Comprehensive assessment for diabetes complications",
    parameters: [
      {
        id: "screening",
        name: "Screening",
        value: "Retinopathy, nephropathy, neuropathy",
        status: "normal",
        timestamp: currentDate
      }
    ],
    x: 3,
    y: 12,
    connections: []
  });

  return nodes;
};

export const getStatusClass = (status: 'normal' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'normal':
      return 'health-tag-good';
    case 'warning':
      return 'health-tag-moderate';
    case 'critical':
      return 'health-tag-poor';
    default:
      return 'health-tag-good';
  }
};

export const getStatusIcon = (status: 'normal' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'normal':
      return '✓';
    case 'warning':
      return '⚠️';
    case 'critical':
      return '!';
    default:
      return '✓';
  }
};

export const getChangeIcon = (change?: 'improved' | 'declined' | 'stable'): string => {
  switch (change) {
    case 'improved':
      return '↑';
    case 'declined':
      return '↓';
    case 'stable':
      return '→';
    default:
      return '';
  }
};
