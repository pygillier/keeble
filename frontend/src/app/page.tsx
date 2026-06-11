import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background p-8 text-center">
      <h1 className="font-display text-4xl text-forest">Keeble</h1>
      <p className="mt-2 max-w-sm text-slate">
        A self-hostable family document vault. Scaffolding in progress.
      </p>
      <Button className="mt-6 bg-forest hover:bg-forest-hover">
        Get started
      </Button>
    </div>
  );
}
