import type { EvidenceStore } from "../evidence/EvidenceStore";
import type { PlayerController } from "../player/PlayerController";
import type { WorldStateStore } from "./WorldStateStore";
import type { WorldStateSnapshot } from "./worldStateTypes";

export interface PlayerSnapshot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly yaw: number;
  readonly pitch: number;
}

export interface Checkpoint {
  readonly id: string;
  readonly label: string;
  readonly worldState: WorldStateSnapshot;
  readonly evidenceIds: readonly string[];
  readonly player: PlayerSnapshot;
  readonly createdAt: number;
}

type Listener = (current: Checkpoint | null) => void;

/**
 * Minimal checkpoint snapshot system for the M3 slice. Holds a single
 * "most recent" checkpoint — intentionally not a full save slot manager.
 * Snapshots capture world-state flags, collected evidence ids, and player
 * pose. Restore writes them back through the authoritative stores so any
 * subscribers (door visuals, objective overlay, evidence board) update via
 * their normal change paths.
 */
export class CheckpointManager {
  private readonly world: WorldStateStore;
  private readonly evidence: EvidenceStore;
  private readonly player: PlayerController;
  private readonly listeners = new Set<Listener>();
  private current: Checkpoint | null = null;

  constructor(
    world: WorldStateStore,
    evidence: EvidenceStore,
    player: PlayerController,
  ) {
    this.world = world;
    this.evidence = evidence;
    this.player = player;
  }

  getCurrent(): Checkpoint | null {
    return this.current;
  }

  hasCheckpoint(): boolean {
    return this.current !== null;
  }

  /** Capture and replace the current checkpoint. */
  save(id: string, label: string): Checkpoint {
    const pose = this.player.getPose();
    const checkpoint: Checkpoint = {
      id,
      label,
      worldState: this.world.get(),
      evidenceIds: this.evidence.collectedIds(),
      player: {
        x: pose.x,
        y: pose.y,
        z: pose.z,
        yaw: pose.yaw,
        pitch: pose.pitch,
      },
      createdAt: Date.now(),
    };
    this.current = checkpoint;
    for (const listener of this.listeners) listener(checkpoint);
    return checkpoint;
  }

  /** Restore the latest checkpoint. No-op if none exists. */
  restore(): boolean {
    const cp = this.current;
    if (!cp) return false;
    this.world.replaceAll(cp.worldState);
    this.evidence.replace(cp.evidenceIds);
    this.player.setPose(
      cp.player.x,
      cp.player.y,
      cp.player.z,
      cp.player.yaw,
      cp.player.pitch,
    );
    return true;
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
