import {
  BarChart3,
  Blocks,
  Bot,
  Code2,
  Compass,
  Gem,
  Lightbulb,
  Megaphone,
  MonitorPlay,
  PartyPopper,
  PenLine,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import type { ServiceSlug } from "@/lib/constants";

export const SERVICE_ICONS: Record<
  ServiceSlug,
  React.ComponentType<{ className?: string }>
> = {
  branding: Gem,
  "digital-strategy": Compass,
  "social-media-marketing": Megaphone,
  "content-marketing": PenLine,
  "email-sms-marketing": Send,
  "experiential-marketing": Sparkles,
  "billboard-led-advertising": MonitorPlay,
  "web-development": Code2,
  "custom-software": Blocks,
  "ai-automation": Bot,
  "seo-geo-aeo": Search,
  "data-analytics": BarChart3,
  "it-consulting": Lightbulb,
  "e-invitations": PartyPopper,
};
