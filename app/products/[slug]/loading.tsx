export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-[#fffdf9] px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1500px] animate-pulse gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div className="aspect-[3/4] bg-[#eee5dd]" />
        <div className="pt-10">
          <div className="h-3 w-24 bg-[#eadfd6]" />
          <div className="mt-6 h-20 max-w-md bg-[#eadfd6]" />
          <div className="mt-8 h-4 w-24 bg-[#eadfd6]" />
        </div>
      </div>
    </main>
  );
}