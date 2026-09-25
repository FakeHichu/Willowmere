# Willowmere

A cozy, cottagecore-inspired multiplayer farm village game built with Next.js, Phaser, and modern web technologies.

## Overview

Willowmere is a browser-based interactive social world where players can create characters, explore a peaceful village, interact with NPCs, complete quests, and see other players in real-time.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
cd willowmere

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize the database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages (root for Next.js)
│   ├── page.tsx           # Landing page
│   ├── create/            # Character creation
│   └── play/              # Main game
├── frontend/              # Frontend React components & utilities
│   ├── components/        # React components
│   │   ├── CharacterCreator.tsx
│   │   ├── DialogueUI.tsx
│   │   └── GameCanvas.tsx
│   ├── lib/               # Frontend utilities (deprecated, use shared/data)
│   └── styles/            # Global styles
├── backend/               # Backend server code
│   ├── api.ts             # API utilities & data re-exports
│   ├── db.ts              # Prisma client (mocked for build)
│   └── socket/            # Socket.IO multiplayer server
│       └── socket.ts
├── database/              # Database layer
│   └── prisma/
│       └── schema.prisma  # Prisma schema
├── game/                  # Phaser game engine
│   └── core/
│       ├── GameConfig.ts  # Game configuration
│       └── scenes/        # Game scenes
│           ├── VillageScene.ts
│           └── CharacterCreationScene.ts
├── shared/                # Shared types & utilities (frontend + backend)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Shared utilities
│   └── constants/         # Shared constants
├── data/                  # Game content (data-driven)
│   ├── npcs/              # NPC definitions
│   ├── quests/            # Quest definitions
│   ├── items/             # Item definitions
│   ├── dialogue/          # Dialogue trees
│   ├── characters/        # Character customization
│   └── world/             # World objects & map
```

## Architecture

This project is designed for **modularity**. Content is stored as data, not hard-coded logic.

### Data-Driven Design

- **NPCs**: Defined in `src/data/npcs/index.ts` - change names, personalities, dialogue without touching the NPC engine
- **Quests**: Defined in `src/data/quests/index.ts` - add, modify, or remove quests easily
- **Items**: Defined in `src/data/items/index.ts` - all game items in one place
- **Dialogue**: Defined in `src/data/dialogue/index.ts` - branching dialogue trees
- **Character Customization**: `src/data/characters/index.ts` - hairstyles, clothing, colors
- **World Objects**: `src/data/world/objects.ts` - interactive objects and their behaviors

### Key Systems

1. **Game Engine**: Phaser 3 handles the 2D rendering and game loop
2. **Multiplayer**: Socket.IO for real-time player synchronization
3. **Database**: Prisma + PostgreSQL for persistence
4. **UI**: React + Tailwind CSS for menus and overlays

## Customization Guide

### Adding a New NPC

Edit `data/npcs/index.ts`:

```typescript
{
  id: 'npc_new',
  name: 'New Character',
  role: 'Village Role',
  position: { x: 500, y: 400 },
  sprite: 'npc_new',
  portrait: 'portrait_new',
  personality: ['trait1', 'trait2'],
  backstory: 'Character backstory...',
  dialogueTreeId: 'dialogue_new',
  questIds: ['quest_new']
}
```

### Adding a New Quest

Edit `data/quests/index.ts`:

```typescript
{
  id: 'quest_new',
  name: 'Quest Name',
  description: 'Quest description',
  giverNpcId: 'npc_mabel',
  steps: [
    { id: 'step_1', type: 'talk', targetId: 'npc_target', description: 'Talk to...' },
    { id: 'step_2', type: 'collect', targetId: 'item_flower', quantity: 3, description: 'Collect...' }
  ],
  rewards: [{ type: 'currency', quantity: 10 }]
}
```

### Adding New Clothing

Edit `data/characters/index.ts`:

```typescript
export const tops: CharacterAppearance[] = [
  // Add new item:
  { id: 'top_09', name: 'New Shirt', category: 'top', defaultColor: '#556B2F' }
];
```

### Adding an Interactable Object

Edit `data/world/objects.ts`:

```typescript
{
  id: 'object_new',
  type: 'custom_type',
  position: { x: 300, y: 200 },
  size: { x: 32, y: 32 },
  sprite: 'sprite_name',
  collision: false,
  interactions: [
    { type: 'inspect', label: 'Examine', key: 'E' }
  ]
}
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npx prisma generate --schema=database/prisma/schema.prisma
npx prisma db push --schema=database/prisma/schema.prisma
npx prisma studio --schema=database/prisma/schema.prisma
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/willowmere"
SESSION_SECRET="your-secret-key"
NODE_ENV="development"
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Game Engine**: Phaser 3
- **Multiplayer**: Socket.IO
- **Database**: PostgreSQL + Prisma
- **Rendering**: Canvas 2D (Phaser)

## Controls

- **WASD** or **Arrow Keys**: Move character
- **E**: Interact with objects/NPCs
- **ESC**: Close menus/dialogue

## Features

- [x] Character customization (skin, hair, clothing, accessories)
- [x] Village exploration with collision detection
- [x] 4 NPCs with unique personalities and dialogue
- [x] Quest system with multiple quest types
- [x] Interactive objects (benches, flowers, etc.)
- [x] Sitting mechanic
- [x] Multiplayer foundation with real-time sync
- [x] Responsive design

## Roadmap

- [ ] Full multiplayer with rooms
- [ ] Inventory system UI
- [ ] Item usage and crafting
- [ ] NPC schedules
- [ ] Day/night cycle
- [ ] Weather effects
- [ ] Farming mechanics
- [ ] Housing system
- [ ] Relationship progression
- [ ] Audio system

## License

This project is for educational and demonstration purposes.

---

Built with 🌻 in Willowmere
