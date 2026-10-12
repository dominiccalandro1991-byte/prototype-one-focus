import { createFileRoute } from "@tanstack/react-router";
import { Experience } from '@/features/observatory/experience';
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Portal Masters — Web Observatory | The First Rift' },
    { name: 'description', content: 'Discover, tune, stabilize, and open your own fictional Rift in an original science-inspired interactive observatory.' },
    { property: 'og:title', content: 'Portal Masters — The First Rift' },
    { property: 'og:description', content: 'Three systems. One threshold. A fictional science-inspired portal experience.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Experience,
});
