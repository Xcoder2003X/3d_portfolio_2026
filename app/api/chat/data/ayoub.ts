// Évite les caractères ` (backtick) dans le texte.
export const AYOUB_DATA = `
Name: Ayoub Ait Chikh
Title: Full-Stack Software Engineer and AI Engeneer
Location: Morocco

Education:
- Engineering degree in computer science, ENSAO (École Nationale des Sciences Appliquées d'Oujda)

Core skills:
- Java, Spring Boot, microservices architecture, Spring Security / JWT ,python, Node.js, React,Angular, Next.js, TypeScript,SQL, NoSQL (MongoDB), Git, Docker, Kubernetes ,kafka
- Database migration (Oracle to PostgreSQL), JDBC to JPA/Hibernate
- Generative AI: LLMs, prompt engineering,RAG, embeddings, vector databases, LangChain,Building Ai Agents
- Quality & Methodologies: Clean Code, Design Patterns, REST testing (Postman), Agile
- DevOps &Tools: Git, Docker, Nginx, Linux,consul , keycloak , CI/CD

Experience and projects:
Software Engineering Intern (final-year project)– Credit Agricole du Maroc (CAM / Al Filahi Cash)
March– July 2026
• Data Migration (Oracle → PostgreSQL): Migrated the schema, stored procedures and several thousand rows of data for 2 modules (Transfer
and Deposit) in a staging environment.
• Backend Refactoring: Refactored 2 PL/SQL procedures into Java code using JPA/Hibernate, removing direct JDBC usage.
• Technical Research: Conducted a study of the differences between Oracle and PostgreSQL (data types, PL/SQL vs. PL/pgSQL, NULL and
empty-string handling, sequences), the problems encountered during a migration and their solutions, as well as production risks and mitigation
strategies (testing on a staging environment, data validation, rollback plan).
• Application Architecture: Analyzed the application’s architecture, in particular the roles of Consul and Keycloak.

Software Developer– AI Conform (SaaS, European Market)
March– June 2025
• Full-Stack Development: Developed a GDPR compliance assessment SaaS with Spring Boot (backend) and React (frontend).
• AI/ RAG(Python): Built a RAG pipeline in Python that lets DeepSeek classify the points of legal documents as compliant or non-compliant with
GDPR.
• Performance: Optimized the backend, reducing overall response time by 25%.
• Deployment: Containerized and deployed the multi-service application with Docker and Nginx.



personal projects :
1) Ai Interviewer
AI Interviewer is a web application that simulates realistic interview conversations, evaluates candidate responses, and provides feedback to help users practice and improve. Built as a practical, human-centered AI tool for interview preparation and lightweight candidate screening.

Live demo

https://ai-interviewer-rust-eta.vercel.app
Key features

Role-based interview sessions (interviewer, candidate, different difficulty levels)
AI-generated questions and feedback
Session history and scoring (configurable)
Extensible prompt templates and roles
Tech stack

Frontend: TypeScript, Next.js (React)
AI: OpenAI-compatible LLM integration (configurable provider)
Deployment: Vercel (demo)

2) 3d Game
A focused 3D game project exploring scene composition, interactive mechanics, and visual design. This repository contains the game source, assets, and the core game loop—useful as a learning project or foundation for further gameplay and systems work.

One-line

Lightweight 3D game core demonstrating game loop, scene management, and basic interactions.
Highlights

3D scene setup and camera controls
Player / object interaction examples
Asset pipeline for models, textures, and sounds
Clear structure for game logic and state
Tech stack

Java (core game code)
Optional: OpenGL bindings / JavaFX / LWJGL (see build files)
Build: Maven or Gradle depending on repo configuration

3)Clinic Agent — Dental Clinic AI Receptionist

Clinic Agent is a prototype AI receptionist tailored for dental clinics. It automates appointment scheduling, answers FAQs, and performs first-line triage using conversational flows and domain-specific prompts.

Key features

Conversational interface for booking and rescheduling
FAQ handling and triage prompts (pain level, urgency)
Pluggable adapters for chat UI, SMS (Twilio), or webhook integrations
Prompt templates and simple dialog state management
Tech stack

Python 3.10+
FastAPI (recommended for the web layer)
Async I/O, HTTP endpoints
AI integration: OpenAI or other LLM provider
Optional DB: SQLite/Postgres for appointments and logs

4)yagfi-back

yagfi-back is the backend service powering the Good First Issues tooling. It exposes APIs used by the CLI and frontend to search, filter, and cache beginner-friendly GitHub issues.

Core functionality

Query GitHub issues with filters (language, labels, difficulty)
Cache results to reduce GitHub API usage and rate-limit problems
Authentication handling for higher-rate queries and user-specific data
Endpoints designed for ease of frontend and CLI consumption
Tech stack

Java (Spring Boot recommended)
Database: Postgres (for persistence), Redis (for caching) — recommended
API docs via OpenAPI/Swagger.

Contribution & testing

Add unit tests for API controllers and integration tests for cached flows.
Provide Postman / OpenAPI collection for frontend and CLI teams.

Certifications:
Oracle OCI: Generative AI Certified (2025) | Udemy: Advanced Java (2025) | HackerRank: Problem Solving (2025)

Languages spoken:
- Arabic:fluent , English and frensh :professional level

Personal:
- Loves watching series (recently watched The Mentalist and sherlok)
- Enjoys walking long distances
- Enjoys solving problems and contributing to projects

Availability:
- Open to part-time or full-time roles in software and AI engineering, freelancing, and specialized master's programs outside Morocco.

Contact (public):
- Email: ayoub.aitchikh23@ump.ac.ma
- LinkedIn: https://www.linkedin.com/in/ayoubaitchikh/
- GitHub: https://github.com/Xcoder2003X
`;