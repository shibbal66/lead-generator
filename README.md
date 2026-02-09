
# Lead Generator Pro

Ein modernes Lead-Management-Dashboard mit Kanban-Board, Drag & Drop und LinkedIn-Anreicherung.

## Features
- **Kanban Pipeline**: 5-Stufen Workflow mit Drag & Drop Support.
- **LinkedIn Enrichment**: Automatisches Ausfüllen von Profil-Daten über LinkedIn URLs.
- **Lead Details**: Umfangreiche Erfassung von Kontaktinformationen und Kommentaren.
- **Vollständig Responsive**: Optimiert für Desktop-Workflows, aber mobil bedienbar.
- **Mitarbeiterverwaltung**: Zuordnung von Leads zu verschiedenen Ownern.

## Technischer Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS.
- **Drag & Drop**: `@dnd-kit`.
- **Icons**: `lucide-react`.
- **Datenhaltung**: LocalStorage (Demo-Modus) / Bereit für Prisma & SQLite/Postgres.

## Installation & Start
1. `npm install`
2. `npm run dev`

## Backend Integration (Vorschau)
Das Projekt enthält eine `prisma/schema.prisma` Datei. Um auf ein echtes Backend umzustellen:
1. Provider in `schema.prisma` auf `postgresql` ändern.
2. `npx prisma migrate dev` ausführen.
3. Die `services/api.ts` durch echte API-Calls (Fetch/Axios) ersetzen.

## Enrichment API
In der Produktivumgebung sollte der Endpoint `/api/enrich-linkedin` einen Dienst wie **Proxycurl** oder **Apollo** nutzen.
```typescript
// Beispiel Provider Interface
interface EnrichmentProvider {
  enrich(url: string): Promise<EnrichmentData>;
}
```
