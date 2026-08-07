interface OccupationPageProps {
  params: Promise<{ occupation: string }>;
}

export default async function OccupationPage({ params }: OccupationPageProps) {
  const { occupation } = await params;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-charcoal mb-2">Occupation Detail: {occupation}</h1>
      <p className="text-graphite font-sans">Route shell stub for /careers/[occupation].</p>
    </main>
  );
}
