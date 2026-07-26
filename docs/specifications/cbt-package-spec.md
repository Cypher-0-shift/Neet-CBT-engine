# NEET CBT Engine - JSON Package Specification

The NEET CBT Engine allows users to import offline mock tests via `.zip` files. The zip file must strictly adhere to the following schema, otherwise the Zod validation layer will reject the import.

## ZIP Directory Structure
```text
exam-package.zip
├── metadata.json
├── questions.json
└── images/
    ├── q1-diagram.png
    ├── q1-optB.png
    └── q15-solution.jpg
```

## `metadata.json`
Defines the global parameters of the test package.
```json
{
  "name": "NEET Full Syllabus Mock 1",
  "description": "Standard NTA pattern mock test.",
  "durationMinutes": 200,
  "maxMarks": 720,
  "negativeMarkingRatio": 0.25,
  "totalQuestions": 200,
  "examType": "NEET",
  "language": "EN",
  "version": "1.0",
  "subjectDistribution": {
    "Physics": 50,
    "Chemistry": 50,
    "Biology": 100
  },
  "scoringRules": {
    "correct": 4,
    "incorrect": -1,
    "unattempted": 0
  }
}
```

## `questions.json`
An array of question objects. 
```json
[
  {
    "id": "q-1",
    "questionNumber": 1,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "Motion in a Straight Line",
    "subtopic": "Uniform Acceleration",
    "difficulty": "MEDIUM",
    "questionType": "MCQ",
    "expectedTimeSeconds": 60,
    "questionText": "A car accelerates from rest at a constant rate \\(\\alpha\\) for some time...",
    "questionImage": "images/q1-diagram.png",
    "options": [
      {
        "id": "opt-1",
        "label": "A",
        "text": "\\(\\frac{\\alpha \\beta}{\\alpha + \\beta} t\\)"
      },
      {
        "id": "opt-2",
        "label": "B",
        "text": "\\(\\frac{\\alpha + \\beta}{\\alpha \\beta} t\\)"
      }
    ],
    "answer": {
      "correctOptionId": "opt-1",
      "marks": 4,
      "negativeMarks": 1,
      "explanation": "Let the maximum velocity be \\(v_{max}\\)...",
      "solutionImages": ["images/q1-solution.jpg"],
      "conceptTested": "Velocity-time graphs"
    }
  }
]
```

## Image Rules
- Must be valid `.png`, `.jpg`, or `.jpeg` formats.
- Paths in the JSON must perfectly match the relative paths inside the `.zip` archive (e.g. `images/file.png`).
- SVGs and WebP are strictly forbidden.
