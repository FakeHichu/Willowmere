# Willowmere Implementation Plan

## Current State Analysis

### What Exists (Good Foundation)
- ✅ Next.js 16 + React 19 + TypeScript + Tailwind
- ✅ Phaser 4 game engine with VillageScene and CharacterCreationScene
- ✅ Socket.IO multiplayer foundation (join, move, leave, chat)
- ✅ Prisma schema with Player, InventoryItem, PlayerQuest, Friendship, GameSession
- ✅ Data-driven NPCs (4), Quests (5), Items (15), Dialogue (4), Character customization
- ✅ World objects (benches, flowers, pond, doors, garden plots, pickups)
- ✅ Character customization UI (React) + Phaser preview
- ✅ Village scene with movement, collision, NPC interaction, sitting, item pickup
- ✅ Dialogue UI with branching choices and quest acceptance
- ✅ Shared types for all game systems

### What's Missing (Critical Gaps)
| System | Current State | Required by Spec |
|--------|---------------|------------------|
| Authentication | None (localStorage only) | User registration/login, sessions |
| Server-authoritative movement | Client sends position directly | Server validates, broadcasts |
| Database integration | Mocked in db.ts | Real Prisma operations |
| Player persistence | Local only | Save/load from PostgreSQL |
| NPC schedules | Static positions only | Time-based schedule system |
| NPC movement | Idle animation only | Pathfinding + scheduled movement |
| Game clock | None | Server-authoritative synchronized clock |
| Offline players | Disappear on disconnect | Remain stationary in world |
| Inventory system | Client-side only | Server-authoritative with sync |
| Quest progression | Client-side only | Server-authoritative with flags |
| Story flags | None | Generic flag system |
| Interest management | Broadcast to all | Zone-based updates |
| Building/door system | Doors exist, no function | Enter/exit buildings |
| Global events | None | Festival, persistent world changes |

---

## Implementation Stages

### Stage 1: Database & Authentication (Week 1)
**Goal**: Real persistence and user accounts

1. **Fix Prisma client** - Enable real database operations
2. **Add authentication system**
   - User registration/login API routes
   - JWT session tokens in HttpOnly cookies
   - Password hashing with bcrypt
   - Session validation middleware
3. **Create player on registration** - Link User → Player character
4. **Player CRUD operations** - Load/save position, customization, currency
5. **Database migrations** - Run `prisma db push`

### Stage 2: Server-Authoritative Movement (Week 1-2)
**Goal**: Server validates all movement

1. **Rewrite socket.ts movement handling**
   - Client sends input (direction, not position)
   - Server validates against collision map
   - Server updates authoritative position
   - Server broadcasts to nearby players
2. **Add collision map to server** - Share world bounds/objects
3. **Client-side prediction + interpolation** - Smooth visual movement
4. **Movement rate limiting** - Anti-cheat

### Stage 3: Persistent Player State (Week 2)
**Goal**: Players save/load correctly, offline handling

1. **Save position on disconnect** - Update Player.positionX/Y in DB
2. **Load position on join** - Restore from DB
3. **Offline player rendering** - Keep sprite visible, mark "offline"
4. **Online/offline status** - Track in DB, broadcast changes
5. **Periodic auto-save** - Every 30 seconds

### Stage 4: Real-Time Game Clock (Week 2-3)
**Goal**: Synchronized time for all players

1. **Server game clock** - Tick every second, UTC-based
2. **Configurable timezone** - e.g., "Asia/Kolkata"
3. **Game time format** - Day, hour, minute (fictional calendar)
4. **Clock sync protocol** - Client requests time, server responds
5. **Client interpolation** - Smooth local display between syncs
6. **UI clock display** - Top HUD

### Stage 5: NPC Schedule System (Week 3)
**Goal**: NPCs move according to shared schedule

1. **Extend NPCDefinition** - Add schedule array with time ranges
2. **Schedule engine** - Server calculates current location from time
3. **NPC movement system** - Pathfinding to scheduled positions
4. **Broadcast NPC positions** - To all clients in zone
5. **Schedule overrides** - Event-based temporary changes

### Stage 6: NPC Pathfinding & Movement (Week 3-4)
**Goal**: Smooth NPC navigation

1. **Navigation mesh / grid** - From world objects collision data
2. **A* pathfinding** - Server-side for NPCs
3. **Movement interpolation** - Clients smoothly animate
4. **Arrival handling** - Idle at destination until next schedule change

### Stage 7: Server-Authoritative Interaction System (Week 4)
**Goal**: All interactions validated server-side

1. **Interaction protocol** - Client requests, server validates, broadcasts result
2. **NPC dialogue** - Server tracks dialogue state per player
3. **Object interactions** - Sit, pickup, inspect, doors
4. **Door/building system** - Teleport between maps (future)
5. **Quest progression** - Server updates PlayerQuest

### Stage 8: Inventory & Items (Week 4-5)
**Goal**: Persistent, server-authoritative inventory

1. **Inventory API** - Get, add, remove, use items
2. **World item pickups** - Server spawns/removes, syncs to clients
3. **Stacking, categories, limits** - Enforced server-side
4. **Item definitions** - Shared between client/server

### Stage 9: Personal Quests & Story Flags (Week 5)
**Goal**: Independent progression per player

1. **Quest engine** - Server tracks steps, prerequisites, completion
2. **Flag system** - Generic key-value store per player
3. **Dialogue conditions** - Check flags, quest state, items
4. **Personal events** - Triggered by flags, not global

### Stage 10: Global Events & Interest Management (Week 5-6)
**Goal**: Scalable multiplayer with world events

1. **Zone system** - Divide world into chunks
2. **Interest management** - Only send updates for nearby entities
3. **Global event system** - Festivals, persistent world changes
4. **Event overrides** - NPC schedule changes during events

### Stage 11: Polish & MVP Completion (Week 6+)
**Goal**: Playable MVP matching specification

1. **UI polish** - Quest log, inventory UI, clock display
2. **Mobile support** - Touch controls
3. **Audio system** - Ambient, SFX
4. **Animations** - Proper sprite sheets
5. **Testing** - Multi-browser verification per spec §27

---

## File Changes by Stage

### Stage 1: Database & Auth
**New Files:**
- `backend/auth/` - auth routes, JWT utilities, password hashing
- `backend/players/` - player CRUD operations
- `app/api/auth/` - Next.js API routes for register/login/me/logout
- `database/prisma/migrations/` - auto-generated

**Modified Files:**
- `backend/db.ts` - Real Prisma client
- `backend/socket/socket.ts` - Auth validation on connection
- `app/create/page.tsx` - Call register API
- `app/play/page.tsx` - Check auth, load character

### Stage 2: Authoritative Movement
**Modified Files:**
- `backend/socket/socket.ts` - Input-based movement, validation
- `game/core/scenes/VillageScene.ts` - Client prediction + interpolation
- `shared/types/index.ts` - Add input types, collision types
- `data/world/objects.ts` - Export collision data for server

### Stage 3: Persistent State
**Modified Files:**
- `backend/socket/socket.ts` - Save on disconnect, load on join
- `backend/players/operations.ts` - Position save/load
- `game/core/scenes/VillageScene.ts` - Render offline players

### Stage 4: Game Clock
**New Files:**
- `backend/time/clock.ts` - Server clock, sync protocol
- `shared/constants/time.ts` - Timezone, calendar config

**Modified Files:**
- `backend/socket/socket.ts` - Broadcast time, handle sync requests
- `game/core/scenes/VillageScene.ts` - Display clock, interpolate
- `app/play/page.tsx` - HUD clock component

### Stage 5: NPC Schedules
**Modified Files:**
- `data/npcs/index.ts` - Add schedules to NPC definitions
- `shared/types/index.ts` - NPCSchedule with time ranges
- `backend/npc/scheduleEngine.ts` - Calculate positions from time

**New Files:**
- `backend/npc/` - NPC manager, movement system

### Stage 6: NPC Pathfinding
**New Files:**
- `backend/navigation/` - Grid, A* pathfinder
- `game/core/scenes/VillageScene.ts` - NPC sprite movement

### Stage 7: Interaction System
**Modified Files:**
- `backend/socket/socket.ts` - Interaction handlers
- `game/core/scenes/VillageScene.ts` - Request interactions
- `data/world/objects.ts` - Server-side interaction logic

### Stage 8: Inventory
**New Files:**
- `backend/inventory/` - Inventory operations
- `shared/types/inventory.ts` - Extended types

**Modified Files:**
- `backend/socket/socket.ts` - Inventory sync
- `app/play/page.tsx` - Inventory UI

### Stage 9: Quests & Flags
**New Files:**
- `backend/quests/` - Quest engine
- `backend/flags/` - Flag system

**Modified Files:**
- `backend/socket/socket.ts` - Quest/flag sync
- `data/dialogue/index.ts` - Server-evaluated conditions

### Stage 10: Global Events & Interest
**New Files:**
- `backend/events/` - Global event manager
- `backend/zones/` - Interest management

**Modified Files:**
- `backend/socket/socket.ts` - Zone-based broadcasting

---

## Technical Decisions

### Architecture Principles
1. **Server = Authority** - All state changes validated server-side
2. **Data-Driven** - Content in `data/`, logic in `game/` and `backend/`
3. **Shared Types** - Single source of truth in `shared/types/`
4. **Incremental** - Each stage builds on previous, testable independently

### Networking
- **Socket.IO** for real-time (already in use)
- **REST API** for auth, initial load, non-realtime operations
- **Zone-based interest management** - 200px radius initially, expand later

### Database
- **PostgreSQL (Neon)** via Prisma
- **Real-time state in memory** - Only persist on disconnect/interval
- **Player position** - Updated in DB every 30s + on disconnect

### Time
- **Server UTC** - Authoritative
- **Game timezone** - Configurable (default: Asia/Kolkata)
- **Fictional calendar** - Day 1 = server start, 24h = 1 game day (or 1h = 1 game day)

### NPC Schedules
```typescript
// Example schedule format
schedule: [
  { start: "07:00", end: "09:00", position: {x:100,y:100}, action: "home" },
  { start: "09:00", end: "17:00", position: {x:400,y:300}, action: "work" },
]
```

---

## MVP Checklist (Specification §26)

- [ ] User registration/login
- [ ] One playable town
- [ ] Free player movement
- [ ] Player collision
- [ ] Multiplayer synchronization
- [ ] Other online players visible
- [ ] Offline players remaining stationary
- [ ] Persistent player positions
- [ ] Real-time synchronized clock
- [ ] At least 3 NPCs
- [ ] NPC schedules
- [ ] NPC movement
- [ ] At least 2 buildings
- [ ] Basic interaction
- [ ] Basic dialogue
- [ ] One personal quest
- [ ] Basic inventory
- [ ] Save/load

---

## Next Immediate Steps

1. **Enable real Prisma client** in `backend/db.ts`
2. **Create auth API routes** in `app/api/auth/`
3. **Implement player registration/login** flow
4. **Connect socket to authenticated sessions**
5. **Test database operations** with Prisma Studio

Let me start with Stage 1.