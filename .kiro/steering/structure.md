---
inclusion: always
---

# Project Structure

```
/
├── .kiro/
│   ├── steering/        # product.md, tech.md, structure.md (this file)
│   ├── specs/           # feature specs (requirements, design, tasks)
│   └── hooks/           # agent hooks
├── public/              # static assets (favicon, images)
├── src/
│   ├── main.tsx         # app entry point
│   ├── App.tsx          # top-level layout and routing between views
│   ├── types.ts         # shared types: Course, Category, Item, Verdict
│   ├── lib/             # pure logic, no React
│   │   ├── grades.ts        # current grade, required scores, verdict
│   │   ├── strategy.ts      # strong-vs-weak category trade-offs
│   │   ├── practicePlan.ts  # gradual practice steps before deadlines
│   │   ├── storage.ts       # localStorage load/save + validation
│   │   └── *.test.ts        # unit tests next to each module
│   ├── hooks/           # custom React hooks (e.g. useCourses)
│   ├── components/      # UI components, one folder each
│   │   └── ComponentName/
│   │       ├── ComponentName.tsx
│   │       ├── ComponentName.module.css
│   │       └── ComponentName.test.tsx
│   └── styles/
│       └── theme.css    # CSS variables: colours, fonts, spacing
├── index.html
├── package.json
├── README.md
└── LICENSE              # MIT
```

## Conventions
- Components: `PascalCase` folder and file names. Everything else: `camelCase`.
- Logic goes in `src/lib/`, rendering goes in `src/components/`. Components call lib functions; they never do grade math inline.
- Shared types are defined only in `src/types.ts`.
- Tests sit next to the file they test (`grades.ts` → `grades.test.ts`).
- Never add `.kiro/` to `.gitignore`. It must be committed.
