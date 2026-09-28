import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer({ onNavigate }) {
  return (
    <footer id="contact" className="scroll-mt-24 bg-[#071f1a] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.2fr_.8fr_.8fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-white"><img src="/elara-logo.png" alt="Elara Hotel logo" className="h-full w-full object-contain p-1" /></span>
              <div><p className="font-serif text-xl font-semibold tracking-[0.24em]">ELARA</p><p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Hotel Tagaytay</p></div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">A contemporary Tagaytay retreat for quiet weekends, thoughtful stays, and slower moments.</p>
            <div className="mt-6 flex gap-2">
              <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold"><Instagram size={17} /></a>
              <a href="#" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold"><Facebook size={17} /></a>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Explore</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              <li><button onClick={() => onNavigate("Rooms")} className="hover:text-white">Rooms & Suites</button></li>
              <li><button onClick={() => onNavigate("Offers")} className="hover:text-white">Offers</button></li>
              <li><button onClick={() => onNavigate("My Booking")} className="hover:text-white">My Booking</button></li>
              <li><button onClick={() => onNavigate("Home")} className="hover:text-white">Hotel Overview</button></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Contact</h2>
            <ul className="mt-5 space-y-4 text-sm text-white/60">
              <li className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-gold" /><span>Tagaytay City<br />Cavite, Philippines</span></li>
              <li className="flex gap-3"><Phone size={17} className="shrink-0 text-gold" /><span>Reservations desk</span></li>
              <li className="flex gap-3"><Mail size={17} className="shrink-0 text-gold" /><span>Guest inquiries</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold">Stay in the know.</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">Receive seasonal offers, stay inspiration, and Elara updates.</p>
            <form className="mt-5 flex overflow-hidden rounded-full border border-white/15 bg-white/5" onSubmit={(e) => e.preventDefault()}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/35" />
              <button type="submit" className="grid w-12 place-items-center text-gold" aria-label="Subscribe"><ArrowRight size={18} /></button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Elara Hotel. All rights reserved.</p>
          <div className="flex flex-wrap gap-5"><a href="#" className="hover:text-white">Privacy</a><a href="#" className="hover:text-white">Terms</a><a href="#" className="hover:text-white">Accessibility</a></div>
        </div>
      </div>
    </footer>
  );
}
