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
              <a href="https://www.instagram.com/mr_vicky_jetani/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zM4.5 7.75A3.25 3.25 0 017.75 4.5h8.5a3.25 3.25 0 013.25 3.25v8.5a3.25 3.25 0 01-3.25 3.25h-8.5a3.25 3.25 0 01-3.25-3.25v-8.5zm9.5 1a4 4 0 11-4 4 4 4 0 014-4zm0 1.5a2.5 2.5 0 102.5 2.5 2.5 2.5 0 00-2.5-2.5zm3.5-.75a.75.75 0 11.75-.75.75.75 0 01-.75.75z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/jet-vivek-jetani/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-all hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/916351051238" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.763.456 3.42 1.254 4.86l-1.254 4.544 4.654-1.221c1.405.748 3.003 1.177 4.7 1.177 5.523 0 10-4.477 10-10s-4.477-10-10-10zm.006 18c-1.534 0-2.973-.42-4.209-1.147l-.302-.178-2.756.723.738-2.673-.195-.31c-.811-1.285-1.282-2.812-1.282-4.444 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.686-6.426c-.256-.128-1.516-.748-1.751-.833-.235-.085-.406-.128-.577.128-.171.256-.662.833-.812.914-.149.081-.299.091-.427.027-.128-.064-.541-.199-1.031-.636-.381-.339-.638-.758-.713-.886-.075-.128-.008-.198.056-.261.058-.057.128-.149.192-.224.064-.075.085-.128.128-.214.043-.085.021-.16-.011-.224-.032-.064-.406-.983-.556-1.346-.146-.355-.295-.307-.406-.312s-.234-.006-.362-.006c-.128 0-.341.048-.521.245-.179.197-.683.667-.683 1.625 0 .958.697 1.882.793 2.01.096.128 1.371 2.094 3.322 2.936.464.2.825.32 1.107.41.466.148.889.127 1.225.077.375-.056 1.15-.47 1.312-.924.162-.454.162-.844.113-.924-.048-.08-.179-.128-.435-.256z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200 mb-6">COMPANY</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link to="/about" className="hover:text-primary dark:hover:text-primary-dark transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Careers 🚀</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200 mb-6">SUPPORT</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link to="/help-center" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Help Center</Link></li>
              <li><Link to="/safety-info" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Safety Info</Link></li>
              <li><Link to="/cancellation" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Cancellation</Link></li>
              <li><Link to="/contact-us" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Contact Us</Link></li>
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
