import { 
  Headphones, 
  LayoutList, 
  GraduationCap, 
  Mic, 
  BookOpen 
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
    id: "quiz",
    label: "/quiz",
    description: "Generate an adaptive learning quiz",
    icon: GraduationCap,
  },
  {
    id: "voice",
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