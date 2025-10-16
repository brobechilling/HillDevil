# Copilot Instructions for Restaurant SaaS Frontend

## Project Overview
This is a frontend-only React + TypeScript project for a **Restaurant Management SaaS**. It supports multiple roles: customer, owner, staff, manager, and admin. The app includes features like menus, orders, billing, membership, branches, tables, reports, and dashboard analytics.

## Tech Stack & Conventions
- React 18+ with Vite  
- TypeScript  
- Zustand for global state  
- React Router v7  
- TailwindCSS v4 and shadcn/ui (Radix + Tailwind components)  
- Use React Query (TanStack Query) for data fetching, but here it's mocked in frontend  
- Use React Hook Form + Zod for form validation  
- APIs follow RESTful design: `GET /resources`, `POST /resources`, `PUT /resources/:id`, `DELETE /resources/:id`  
- Use Axios with interceptors for HTTP layer (mock or real)  
- Use date-fns for date/time formatting  
- Use descriptive naming, avoid abbreviations, use early returns, keep components small and composable  

## Code Style and Best Practices
- Always add JSDoc or comment above exported functions/components  
- Keep code DRY and avoid duplication  
- Prefer functional components with hooks over class components  
- Use `useEffect(() => { … }, [])` to run side effects once, avoid setState in render  
- In Zustand store selectors, avoid returning new arrays/objects inside selectors (to prevent infinite re-renders)  
- On routes, wrap protected routes in `ProtectedRoute` component which checks user role  
- Use consistent folder structure: `components/ui`, `features/*`, `routes`, `store`, `pages`, `utils`  
- Write types/interfaces in `src/types` and reuse them  
- In React Query and Axios, always handle errors gracefully  
- For forms, use `zod` schemas matching the API payloads  

## How to Use These Instructions
- When generating new components, pages or routes, refer to this file  
- Copilot should prioritize this project’s tech stack and style  
- If a prompt conflicts with these rules, follow this file’s guidelines  
