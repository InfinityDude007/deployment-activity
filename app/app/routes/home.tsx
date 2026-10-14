import type { Route } from "./+types/home";
import { Game } from "../game/Game";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Operation Midnight Deploy" },
        {
            name: "description",
            content:
                "A DevOps escape room based on Docker, GHCR and GitHub Actions.",
        },
    ];
}

export default function Home() {
    return <Game />;
}
