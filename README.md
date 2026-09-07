# Click to Clinic

Click to Clinic is a healthcare management platform for patients, doctors, laboratories, pharmacies, and administrators.

## Current status

The workspace foundation is in place. The application is organized as four runnable workspaces:

- `backend` - Node.js and Express API
- `frontend` - React and Vite patient portal
- `admin` - React and Vite administration and doctor portal
- `mobile` - Expo React Native application

## Local development

Install dependencies in each workspace, then run the required services:

```powershell
npm install --prefix backend
npm install --prefix frontend
npm install --prefix admin
npm install --prefix mobile
```

```powershell
npm run server --prefix backend
npm run dev --prefix frontend
npm run dev --prefix admin
npm start --prefix mobile
```

Create environment files from the `.env.example` files in each workspace. Do not commit secret values. The backend requires database, media storage, authentication, payment, and AI service configuration; the web and mobile applications require backend and payment endpoint configuration.

## Project roadmap

The complete implementation roadmap is maintained in [MIGRATION_PLAN.md](./MIGRATION_PLAN.md). Work is being delivered as small, verified commits so each application layer remains understandable and runnable.
