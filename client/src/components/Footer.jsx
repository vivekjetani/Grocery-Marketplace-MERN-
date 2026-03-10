import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Footer = () => {
  const handleFooterSubscribe = (e) => {
    e.preventDefault();
    toast.success("Subscribed! 🎉");
    e.target.reset();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="text-slate-600 dark:text-slate-400 pt-16 pb-8 px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-wrap justify-between gap-12 md:gap-6">
          <div className="max-w-80">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
              Gramodaya
            </h1>
            <p className="text-sm leading-relaxed">
              We're bringing you the freshest produce with the most vibey shopping experience.
              Drop the boring lists and shop like it's 2026.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zM4.5 7.75A3.25 3.25 0 017.75 4.5h8.5a3.25 3.25 0 013.25 3.25v8.5a3.25 3.25 0 01-3.25 3.25h-8.5a3.25 3.25 0 01-3.25-3.25v-8.5zm9.5 1a4 4 0 11-4 4 4 4 0 014-4zm0 1.5a2.5 2.5 0 102.5 2.5 2.5 2.5 0 00-2.5-2.5zm3.5-.75a.75.75 0 11.75-.75.75.75 0 01-.75.75z" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 hover:text-white transition-all hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 5.92a8.2 8.2 0 01-2.36.65A4.1 4.1 0 0021.4 4a8.27 8.27 0 01-2.6 1A4.14 4.14 0 0016 4a4.15 4.15 0 00-4.15 4.15c0 .32.04.64.1.94a11.75 11.75 0 01-8.52-4.32 4.14 4.14 0 001.29 5.54A4.1 4.1 0 013 10v.05a4.15 4.15 0 003.33 4.07 4.12 4.12 0 01-1.87.07 4.16 4.16 0 003.88 2.89A8.33 8.33 0 012 19.56a11.72 11.72 0 006.29 1.84c7.55 0 11.68-6.25 11.68-11.67 0-.18 0-.35-.01-.53A8.18 8.18 0 0022 5.92z" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512">
                  <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200 mb-6">COMPANY</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Careers 🚀</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Partners</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200 mb-6">SUPPORT</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Safety Info</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Cancellation</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div className="max-w-80">
            <p className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200 mb-6">STAY UPDATED</p>
            <p className="text-sm mb-4">
              Get the latest drops, sustainable finds, and exclusive discounts right in your inbox.
            </p>
            <form onSubmit={handleFooterSubscribe} className="flex items-center group relative">
              <input
                type="email"
                className="w-full bg-white dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-600 h-10 pl-5 pr-12 outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all text-slate-900 dark:text-white"
                placeholder="you@vibes.com"
                required
              />
              <button type="submit" className="absolute right-1 top-1 bottom-1 aspect-square rounded-full bg-primary hover:bg-accent text-white flex items-center justify-center transition-colors" aria-label="Subscribe">
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800 my-8" />

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-xs font-medium">
          <p>© {new Date().getFullYear()} Gramodaya. All rights reserved.</p>
          <ul className="flex items-center gap-6">
            <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Terms</a></li>
            <li><a href="#" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Sitemap</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
