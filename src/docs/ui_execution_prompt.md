# AntyGravity — UI Execution Master File (MF)

## Status
- ✅ Component analysis completed and locked
- ✅ Responsibilities, data flow, and state ownership are understood
- 🚫 Re-analysis is forbidden

---

## Inputs You Must Trust
- `/docs/dashboard_employee_components_analysis.md`
- `/docs/component_analysis_prompt.md`
- `/docs/ui_refactor_rules.md`
- `/docs/theme_rules.md`

These documents represent the **source of truth**.

---

## Global Execution Rules
- UI changes ONLY
- No business logic changes
- No API, state, or data-flow changes
- No renaming variables, props, or functions
- No moving logic between files
- No performance-heavy visual effects

---

## Design Objective
Apply **Apple iOS / visionOS–inspired Liquid Glass UI** using:
- Translucent glass layers
- Backdrop blur
- Soft specular borders
- Subtle depth separation
- Spring-based motion (natural, calm, physical)

The UI must feel:
- Light
- Fluid
- Comfortable for long sessions
- High-clarity, low eye strain

---

## Motion System Rules
- Use `framer-motion` only
- Prefer spring animations
  - stiffness: 120–180
  - damping: 18–26
- Entry:
  - opacity: 0 → 1
  - scale: 0.96 → 1
- Layout changes must use `layout` or `layoutId`
- Motion must never distract from data

---

## Visual Hierarchy Rules
- Dashboards → layered glass panels
- Modals → floating glass sheets with depth
- Dragged elements → lifted glass with increased blur
- Drop zones → soft glow / pulse feedback
- Passive widgets → minimal motion, maximum clarity

---

## Component Execution Priority
### Tier 1 — Interaction Heavy (Liquid Physics)
- TaskAssignmentModal.jsx
- ProjectBoard.jsx
- ProjectDetailView.jsx

Focus:
- Drag lift
- Drop pulse
- Layout morphing
- Spring reflow

---

### Tier 2 — Dashboard Structure
- HRDashboard.jsx
- EmployeeCockpit.jsx
- AssignedProjectsList.jsx

Focus:
- Glass segmentation
- Depth layering
- Smooth section transitions

---

### Tier 3 — Passive Widgets
- ActiveProjectTracker.jsx
- DeadlineNotifications.jsx
- ProjectsPreview.jsx
- WorkReportForm.jsx

Focus:
- Readability
- Calm motion
- Visual polish only

---

## Execution Instructions
When modifying a component:
1. Respect its existing structure and responsibility
2. Enhance visual depth using glass layers
3. Improve interaction feedback using motion
4. Preserve all logic exactly as-is
5. Stop once UI clarity and comfort are achieved

---

## Forbidden Actions
❌ Rewriting logic  
❌ Changing state shape  
❌ Introducing new data dependencies  
❌ Over-animating  
❌ Making UI flashy instead of usable  

---

## Completion Definition
A component is complete when:
- UI feels physically layered
- Interactions feel soft and responsive
- No logic was altered
- Readability improved without distraction

End execution when this state is reached.