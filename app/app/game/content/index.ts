import type { Room } from "../types";
import { dockyard } from "./dockyard";
import { vault } from "./vault";
import { pipeline } from "./pipeline";
import { crypt } from "./crypt";

export const ROOMS: Room[] = [dockyard, vault, pipeline, crypt];

export const MASTER_CODE = ROOMS.map((r) => r.fragment).join(""); // DEPLOYED

export const MAX_PUZZLE_POINTS = ROOMS.flatMap((r) => r.puzzles).reduce(
    (s, p) => s + p.points,
    0,
);
