# NEET CBT Simulator — Improvements & Antigravity Starting Prompt
 
## 1. Gap Analysis (short)
 
Current audit shows a **6-engine analytics system** (Score, Subject, Topic, Time, Accuracy, Difficulty). This is over-built for the scope you actually want.
 
**Your actual requirement:**
- Per-question: time spent + correct/wrong/unattempted
- Subject-wise: time spent, marks scored, accuracy
- Results screen: correct vs incorrect breakdown, nothing else
**Already present in architecture (keep, don't rebuild):**
- Zip import pipeline (metadata.json + questions.json + images/) → SQLite
- Test Library with persistence — once a test is imported/attempted, it stays listed
- Exam engine (subject tabs, palette, timer, autosave, keyboard shortcuts)
- Instructions screen → Exam → Review/Summary screen → Final Submit
## 2. Improvements To Make
 
1. **Trim analytics engines** — remove/merge TopicAnalyzer + DifficultyAnalyzer (not needed). Keep only:
   - `ScoreCalculator` (total marks, negative marks)
   - `SubjectAnalyzer` (per-subject time, marks, accuracy)
   - `TimeAnalyzer` (per-question time, simplified — no "3+ min wasted" heuristic, just raw time log)
   - Merge correctness into the same per-question record instead of a separate `AccuracyAnalyzer`
2. **Per-question record** must store: `questionId`, `subject`, `timeSpentSeconds`, `status` (correct/wrong/unattempted/marked), `selectedOptionId`, `correctOptionId`.
3. **Results screen**: simple list/table — question no., your answer, correct answer, correct/wrong tag. No extra insights, no charts unless subject-wise summary.
4. **Subject-wise summary card**: time spent, marks, accuracy % — per subject (Physics/Chemistry/Biology).
5. **Test Library persistence**: confirm attempted/imported tests always show status (never attempted / in-progress / completed) and reappear after app restart — this should already work via SQLite, just verify no regression.
6. **UI tone**: no NTA branding, no portal-like watermarks/logos — keep it visually neutral so it doesn't feel like a copied third-party exam portal.
7. **Flow lock-in**: Instructions screen → Exam Engine → Review/Summary screen (answered/blank/marked per subject) → Final Submit → Results screen (with the simplified analytics above).