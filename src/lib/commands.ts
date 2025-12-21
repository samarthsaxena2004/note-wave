import { 
  Mic, BookOpen, LayoutList, HelpCircle, 
  Image as ImageIcon, Video, Headphones 
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
    id: "summary",
    label: "/summary",
    description: "Create a structured executive summary",
    icon: BookOpen,
  },
  {
    id: "quiz",
    label: "/quiz",
    description: "Generate an adaptive learning quiz",
    icon: HelpCircle,
  },
  {
    id: "flashcards",
    label: "/flashcards",
    description: "Extract key concepts into flashcards",
    icon: LayoutList,
  },
  {
    id: "image",
    label: "/image",
    description: "Generate visual aids for this topic",
    icon: ImageIcon,
  },
  {
    id: "video",
    label: "/video",
    description: "Generate a short explanatory video",
    icon: Video,
  },
];