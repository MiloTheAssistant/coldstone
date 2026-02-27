import Image from "next/image";

const products = [
  {
    name: "Black Granite",
    tagline: "Deep. Refreshing. Pure.",
    description: "Activated charcoal and tea tree essential oil combine to deliver a deep, refreshing cleanse. Crafted using traditional cold process methods and cured for weeks.",
    ingredients: "Olive oil, coconut oil, shea butter, activated charcoal, tea tree essential oil",
    price: "$12",
    image: "/black-granite.jpg",
  },
  {
    name: "Stone Forge",
    tagline: "Strength in Simplicity.",
    description: "A rugged blend of cedar and sage essential oils grounded in a triple-butter base. For those who demand more from every wash.",
    ingredients: "Olive oil, coconut oil, shea butter, cocoa butter, cedar essential oil, sage essential oil",
    price: "$14",
    image: "/stone-forge.jpg",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-[0.2em] text-stone-800">
              COLDSTONE
            </h1>
            <p className="font-sans text-xs md:text-sm tracking-[0.3em] text-stone-500 mt-1">
              SOAP CO.
            </p>
          </div>
          <nav className="hidden md:flex gap-8 text-sm tracking-wider text-stone-600">
            <a href="#shop" className="hover:text-stone-800 transition-colors">SHOP</a>
            <a href="#process" className="hover:text-stone-800 transition-colors">PROCESS</a>
            <a href="#about" className="hover:text-stone-800 transition-colors">ABOUT</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-stone-800 mb-6">
            Pure. American. Uncompromising.
          </h2>
          <p className="text-lg md:text-xl text-stone-600 mb-10 max-w-2xl mx-auto">
            Minimal ingredient cold process soap. Veteran owned. Small batch crafted.
          </p>
          <a
            href="#shop"
            className="inline-block bg-stone-800 text-stone-50 px-10 py-4 text-sm tracking-[0.2em] hover:bg-stone-700 transition-colors"
          >
            SHOP THE COLLECTION
          </a>
        </div>
      </section>

      {/* Products */}
      <section id="shop" className="py-20 px-6 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-serif text-2xl md:text-3xl text-center text-stone-800 mb-16">
            The Collection
          </h3>
          <div className="grid md:grid-cols-2 gap-12">
            {products.map((product) => (
              <div key={product.name} className="group">
                <div className="aspect-square bg-stone-200 mb-6 overflow-hidden relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-serif text-2xl text-stone-800">{product.name}</h4>
                  <p className="text-sm tracking-wider text-stone-500 mt-1">{product.tagline}</p>
                  <p className="text-stone-600 mt-4 text-sm leading-relaxed max-w-md mx-auto">
                    {product.description}
                  </p>
                  <p className="text-xs text-stone-400 mt-3 font-sans">
                    {product.ingredients}
                  </p>
                  <p className="text-lg font-semibold text-stone-800 mt-4">{product.price}</p>
                  <button className="mt-4 border border-stone-800 text-stone-800 px-6 py-2 text-sm tracking-wider hover:bg-stone-800 hover:text-stone-50 transition-colors">
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-serif text-2xl md:text-3xl text-stone-800 mb-12">
            Our Process
          </h3>
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="w-16 h-16 border-2 border-stone-800 mx-auto mb-4 flex items-center justify-center">
                <span className="font-serif text-xl">1</span>
              </div>
              <h4 className="font-serif text-lg text-stone-800 mb-2">Cold Process</h4>
              <p className="text-sm text-stone-600">
                Traditional method preserving natural glycerin. No heat, no shortcuts.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 border-2 border-stone-800 mx-auto mb-4 flex items-center justify-center">
                <span className="font-serif text-xl">2</span>
              </div>
              <h4 className="font-serif text-lg text-stone-800 mb-2">Slow Cured</h4>
              <p className="text-sm text-stone-600">
                Cured for 4-6 weeks ensuring a hard, long-lasting bar with dense lather.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 border-2 border-stone-800 mx-auto mb-4 flex items-center justify-center">
                <span className="font-serif text-xl">3</span>
              </div>
              <h4 className="font-serif text-lg text-stone-800 mb-2">American Made</h4>
              <p className="text-sm text-stone-600">
                Veteran-owned. Small batch. Proudly made in the USA with domestic oils.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-stone-800 text-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-serif text-2xl md:text-3xl mb-8">
            Built on Discipline
          </h3>
          <p className="text-stone-300 leading-relaxed max-w-2xl mx-auto">
            Coldstone Soap Co. was founded on the belief that everyday essentials should be built with intention. 
            As a veteran-owned small business, we apply discipline and precision to the craft of soapmaking. 
            Each batch is produced using the traditional cold process method and cured slowly to ensure durability, 
            skin compatibility, and performance.
          </p>
          <div className="mt-10 flex justify-center gap-8 text-sm tracking-wider">
            <span>VETERAN OWNED</span>
            <span>•</span>
            <span>SMALL BATCH</span>
            <span>•</span>
            <span>USA MADE</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-stone-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center">
            <h5 className="font-serif text-lg tracking-[0.15em]">COLDSTONE</h5>
            <p className="text-xs tracking-wider text-stone-500 mt-1">SOAP CO.</p>
          </div>
          <p className="text-xs text-stone-400">
            © 2026 Coldstone Soap Co. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
