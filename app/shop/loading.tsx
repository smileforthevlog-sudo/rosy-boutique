export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-[#fffdf9] px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px] animate-pulse">
        <div className="h-3 w-28 bg-[#eadfd6]" />
        <div className="mt-6 h-24 max-w-2xl bg-[#eadfd6] sm:h-32" />
        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item}>
              <div className="aspect-[3/4] bg-[#eadfd6]" />
              <div className="mt-4 h-5 w-2/3 bg-[#eadfd6]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}