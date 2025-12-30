// FILE: src/lib/commands.ts
import { 
  Headphones, LayoutList, GraduationCap, Mic, BookOpen, Zap, MessageSquare, ShieldCheck 
} from "lucide-react";

export interface Command {
  id: string;
  label: string;
  description: string;
  icon: any;
}

export const COMMANDS: Command[] = [
  { id: "podcast", label: "/podcast", description: "Generate AI audio", icon: Headphones },
  { id: "flashcards", label: "/flashcards", description: "Extract study cards", icon: LayoutList },
  { id: "graph", label: "/graph", description: "3D Knowledge Graph", icon: Zap },
  { id: "debate", label: "/debate", description: "Multi-agent debate", icon: MessageSquare },
  { id: "vault", label: "/vault", description: "Truth & bias audit", icon: ShieldCheck },
  { id: "quiz", label: "/quiz", description: "Adaptive quiz", icon: GraduationCap },
  { id: "voice", label: "/voice", description: "Talk to document", icon: Mic },
  { id: "summary", label: "/summary", description: "Executive summary", icon: BookOpen },
];