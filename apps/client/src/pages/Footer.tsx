const Footer = () => {
  return (
    <footer className="bg-sky-950 p-6 text-center lg:text-left">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
        <div className="text-slate-50 font-serif">
          <p>&copy; {new Date().getFullYear()} BlogNest</p>
          <p>All rights reserved.</p>
        </div>

        <div className="text-slate-50 font-serif">
          <p>Made by -Karanpreet Singh</p>
        </div>

        <div className="flex space-x-6">
          <a href="https://github.com/Kp-Singh09" target="_blank" rel="noopener noreferrer">
            <svg height="32" viewBox="0 0 72 72" width="32" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fillRule="evenodd">
                <path d="M36,72 C55.88,72 72,55.88 72,36 C72,16.12 55.88,0 36,0 C16.12,0 0,16.12 0,36 C0,55.88 16.12,72 36,72 Z" fill="#3E75C3"/>
                <path d="M36,12 C22.75,12 12,22.79 12,36.1 C12,46.74 18.88,55.77 28.41,58.96 C29.61,59.18 30.05,58.44 30.05,57.8 V53.7 C23.34,55.16 21.93,50.47 21.93,50.47 C20.84,47.69 19.27,46.95 19.27,46.95 C17.09,45.45 19.44,45.48 19.44,45.48 C21.84,45.65 23.11,47.96 23.11,47.96 C25.25,51.65 28.73,50.58 30.1,49.96 C30.31,48.41 30.93,47.35 31.62,46.74 C26.29,46.13 20.69,44.07 20.69,34.84 C20.69,32.21 21.62,30.05 23.16,28.37 C22.91,27.76 22.09,25.31 23.39,21.99 C23.39,21.99 25.41,21.35 29.99,24.46 C31.91,23.93 33.96,23.66 36,23.65 C38.04,23.66 40.09,23.93 42.01,24.46 C46.59,21.35 48.6,21.99 48.6,21.99 C49.91,25.31 49.09,27.76 48.84,28.37 C50.38,30.05 51.31,32.21 51.31,34.84 C51.31,44.09 45.7,46.13 40.35,46.73 C41.21,47.47 41.98,48.94 41.98,51.19 V57.8 C41.98,58.44 42.38,59.19 43.6,58.96 C53.13,55.76 60,46.74 60,36.1 C60,22.79 49.25,12 36,12" fill="#FFF"/>
              </g>
            </svg>
          </a>

          <a href="https://www.linkedin.com/in/kp-singh-/" target="_blank" rel="noopener noreferrer">
            <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
              <g>
                <circle cx="16" cy="16" fill="#007BB5" r="16"/>
                <g>
                  <rect fill="#FFFFFF" height="14" width="4" x="7" y="11"/>
                  <path d="M20.5,11c-2.79,0-3.27,1.02-3.5,2v-2h-4v14h4v-8c0-1.3,0.7-2,2-2s2,0.69,2,2v8h4v-7C25,14,24.48,11,20.5,11z" fill="#FFFFFF"/>
                  <circle cx="9" cy="8" fill="#FFFFFF" r="2"/>
                </g>
              </g>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
