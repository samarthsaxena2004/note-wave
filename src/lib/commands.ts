// FILE: src/lib/commands.ts
import { 
  Headphones, 
  LayoutList, 
  GraduationCap, 
  Mic, 
  BookOpen,
  Zap,
  MessageSquare,
  ShieldCheck
} from "lucide-react";

export interface Command {
  id: string;
  label: string;
  description: string;
  icon: any;
}

export const COMMANDS: Command[] = [
  {
    id: "podcast",
    label: "/podcast",
    description: "Generate an AI audio deep-dive",
    icon: Headphones,
  },
  {
    id: "flashcards",
    label: "/flashcards",
    description: "Extract core study concepts",
    icon: LayoutList,
  },
  {
    id: "graph",
    label: "/graph",
    description: "Visualize 3D knowledge nodes",
    icon: Zap,
  },
  {
    id: "debate",
    label: "/debate",
    description: "Start a multi-agent research debate",
    icon: MessageSquare,
  },
  {
    id: "vault",
    label: "/vault",
    description: "Audit document for bias and truth",
    icon: ShieldCheck,
  },
  {
    id: "quiz",
    label: "/quiz",
    description: "Generate an adaptive learning quiz",
    icon: GraduationCap,
  },
  {
    id: "voice", // Ensure this is the ONLY entry with id: "voice"
    label: "/voice",
    description: "Talk to your document via Deepgram",
    icon: Mic,
  },
  {
    id: "summary",
    label: "/summary",
    description: "Create a structured executive summary",
    icon: BookOpen,
  },
];