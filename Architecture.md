# NEET CBT Practice Desktop Application - Product & Architecture Specification

> **Version:** 1.0
> **Platform:** Desktop Application
> **Mode:** Offline First
> **Target Framework:** Electron + React + TypeScript + Vite + SQLite

---

# Project Objective

Build a **production-quality offline desktop application** that replicates the official **NTA NEET Computer Based Test (CBT)** experience as closely as possible.

The application should not feel like a modern website.

Instead, it should behave exactly like a professional examination software used in real CBT exams.

The primary goal is to develop **exam muscle memory**, improve **time management**, and provide **deep performance analytics** that help students improve over multiple tests.

---

# Core Design Philosophy

## Priority Order

1. Exam Realism
2. Speed
3. Reliability
4. Offline Functionality
5. Performance Analytics
6. Scalability
7. Clean Architecture

---

# Technology Stack

## Desktop

* Electron

## Frontend

* React
* TypeScript
* Vite

## Backend (Local)

* Node.js

## Database

* SQLite
* better-sqlite3

## Charts

* Apache ECharts (preferred)

## ZIP Extraction

* JSZip / yauzl

## State Management

* Zustand

## Styling

* TailwindCSS

---

# Application Architecture

```text
Electron Desktop Shell

│

├── React Frontend

│      ├── Welcome Screen
│      ├── Import Wizard
│      ├── Candidate Details
│      ├── Instructions
│      ├── CBT Exam Engine
│      ├── Question Review
│      ├── Result Dashboard
│      ├── Test History
│      ├── Analytics
│      └── Settings

│

├── Core Services

│      ├── ZIP Import Service
│      ├── JSON Validator
│      ├── Image Loader
│      ├── Test Loader
│      ├── Timer Engine
│      ├── Navigation Engine
│      ├── Session Manager
│      ├── Event Logger
│      ├── Analytics Engine
│      ├── Report Generator
│      ├── Backup Manager
│      └── Export Manager

│

├── SQLite Database

│      ├── Tests
│      ├── Questions
│      ├── Options
│      ├── Sessions
│      ├── Events
│      ├── Analytics
│      ├── Reports
│      ├── Weak Topics
│      └── History

│

└── Local Storage

       Imported Tests

       Images

       Reports

       Backups

       Exports
```

---

# Offline Requirement

The application must work **100% offline**.

No internet connection should be required after installation.

Everything must be stored locally.

---

# Application Flow

```text
Launch

↓

Welcome Screen

↓

Upload Test Package (.zip)

↓

Extract Package

↓

Validate Package

↓

Load Images

↓

Store Test

↓

Candidate Details

↓

Instructions

↓

Start Exam

↓

Exam

↓

Submit

↓

Analytics

↓

History
```

---

# Welcome Screen

The first screen should display:

* Application Logo
* Application Name
* Upload Test Package
* Recent Tests
* Settings

Button:

```
Upload Test Package (.zip)
```

---

# Import Process

After selecting the ZIP:

```
Extracting Package...

Reading JSON...

Loading Images...

Validating Questions...

Checking Answers...

Preparing Database...

Building Exam...

Ready
```

Display progress throughout the process.

---

# Test Summary Screen

Display:

* Test Name
* Total Questions
* Physics Questions
* Chemistry Questions
* Botany Questions
* Zoology Questions
* Duration
* Maximum Marks
* Negative Marking
* Total Images

Button:

```
Continue
```

---

# Candidate Details Screen

Fields:

* Candidate Name
* Registration Number
* Language
* Practice Mode
* Exam Mode

Buttons:

```
Start Instructions
```

---

# Instructions Screen

Replicate the official NTA instructions.

Include:

* Navigation Rules
* Color Legend
* Mark for Review
* Save & Next
* Previous
* Negative Marking
* Fullscreen Instructions

Checkbox:

```
I have read all instructions carefully.
```

Button:

```
I Am Ready To Begin
```

---

# CBT Exam Screen

The interface should closely resemble the official NTA CBT.

## Layout

Header

* Candidate Name
* Registration Number
* Countdown Timer

Body

* Subject Tabs
* Question Area
* Images
* Options
* Navigation Buttons

Right Sidebar

Question Palette

Footer

Navigation Buttons

---

# Navigation Buttons

* Previous
* Next
* Save & Next
* Clear Response
* Mark for Review

---

# Question Palette

Support:

* Not Visited
* Not Answered
* Answered
* Marked for Review
* Answered & Marked

---

# Timer

Countdown timer must always remain visible.

Auto submit when time reaches zero.

---

# Question Rendering

Support:

* Plain Text Questions
* Single Image
* Multiple Images
* Mathematical Expressions
* Chemical Structures
* Tables
* Graphs
* Circuit Diagrams
* Biology Figures

Options must support:

* Text
* Image
* Text + Image

---

# Import Package Structure

```text
Mock_Test.zip

│

├── questions.json

├── metadata.json

├── validation.json

├── answer_key.json

└── images/

      q001.png

      q002.png

      q010_optionA.png

      q010_optionC.png

      q027.png
```

---

# Question JSON Requirements

Every question should support:

* Question ID
* Question Number
* Subject
* Chapter
* Topic
* Subtopic
* Difficulty
* Question Type
* Marks
* Negative Marks
* Expected Time
* Question Text
* Question Image
* Multiple Images
* Options
* Correct Answer
* Solution
* Solution Image
* Tags
* Source
* Year

---

# Event Logging

Log every interaction.

Examples:

* Question Open
* Question Close
* Time Spent
* Option Selected
* Option Changed
* Review Marked
* Review Removed
* Question Revisited
* Idle Time
* Subject Switch
* Fullscreen Exit
* Window Focus Lost
* Submission

Every event should include timestamp.

Store everything in SQLite.

---

# Analytics Engine

Generate detailed analytics after every test.

---

## Overall Performance

* Score
* Accuracy
* Negative Marks
* Attempt Percentage
* Correct Percentage
* Incorrect Percentage
* Skipped Questions

---

## Time Analytics

* Average Time Per Question
* Fastest Question
* Slowest Question
* Time Distribution
* Idle Time
* Section-wise Time

---

## Subject Analysis

Physics

Chemistry

Botany

Zoology

Each should display:

* Accuracy
* Average Time
* Negative Marks
* Attempt Percentage

---

## Topic Analysis

For every topic:

* Accuracy
* Average Time
* Incorrect Questions
* Weakness Score
* Improvement Suggestion

---

## Subtopic Analysis

Support unlimited nesting.

Example:

Physics

→ Mechanics

→ Kinematics

→ Projectile Motion

---

## Difficulty Analysis

Easy

Medium

Hard

Display:

* Accuracy
* Average Time
* Attempt %

---

## Question Type Analysis

Support:

* Conceptual
* Numerical
* Diagram Based
* Graph Based
* Assertion Reason
* Match the Following
* Experimental
* Memory Based
* Formula Based

---

## Behaviour Analysis

Detect:

* Overthinking
* Guessing
* Answer Changing
* Review Efficiency
* Panic
* Time Pressure
* Slow Sections
* Fast Sections

Examples:

* Correct → Wrong changes
* Wrong → Correct changes
* Questions visited multiple times
* Time wasted before answering

---

## Heatmap

Generate a color-coded heatmap for all questions.

Colors:

* Green
* Yellow
* Red
* Grey

---

## Timeline

Display a chronological timeline of the exam.

Examples:

09:00 Started

09:24 Accuracy Dropped

09:41 Long Idle

10:18 Excellent Streak

10:55 Recovered

---

## Progress Tracking

Track performance across all imported tests.

Show trends for:

* Accuracy
* Time
* Speed
* Negative Marks
* Weak Topics
* Strong Topics
* Improvement

---

## AI Recommendations

Generate actionable recommendations such as:

* You consistently spend too much time on Electrostatics.
* You changed 12 correct answers into wrong ones.
* Organic Chemistry requires more timed practice.
* Your Biology accuracy is excellent but speed can improve.

Recommendations should be measurable and practical.

---

# Local Database Tables

Create separate tables for:

* Tests
* Questions
* Options
* Sessions
* Events
* Answers
* Analytics
* Reports
* Weak Topics
* Mistakes
* History
* Settings

---

# Future Features

The architecture must be modular so the following can be added later without major refactoring:

* Wrong Question Notebook
* Bookmarked Questions
* Formula Notebook
* Flashcards
* Weak Topic Tests
* AI Revision Planner
* Weekly Reports
* Monthly Reports
* PDF Export
* Dark Mode
* Backup & Restore
* Multiple Exam Profiles
* Custom Scoring Rules

---

# Engineering Standards

* Feature-based architecture
* Strict TypeScript
* Strong typing
* Clean code
* SOLID principles
* Repository pattern where appropriate
* Proper error handling
* Unit tests for core logic
* Efficient image caching
* Lazy loading
* Optimized SQLite queries
* Autosave and crash recovery
* Modular and extensible design

---

# Final Goal

This application should not feel like a simple mock test platform.

It should feel like a professional **exam simulation and performance intelligence system**.

A student should be able to repeatedly practice NEET exams in an environment that closely matches the official CBT experience while receiving deep insights into their strengths, weaknesses, behaviour patterns, and progress over time.

The architecture should remain generic enough that future exam profiles (JEE, GATE, CAT, UPSC, etc.) can be supported by changing only the question package and scoring configuration, without rewriting the core CBT engine.
