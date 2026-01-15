import { RegisterInputs } from "../components/register/RegisterInputs";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white border border-zinc-300 rounded-sm mb-3">
          {/* Logo Section */}
          <div className="flex flex-col items-center pt-9 pb-3">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Linkly</h1>
            <p className="text-gray-500 text-base font-semibold text-center px-10 mb-2">
              Sign up to see photos and videos from your friends.
            </p>
          </div>

          {/* Register Form */}
          <RegisterInputs />
        </div>

        {/* Already have account card */}
        <div className="bg-white border border-zinc-300 rounded-sm p-6 text-center">
          <p className="text-sm">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-500 font-semibold hover:text-indigo-700"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Get the app section */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-900 mb-4">Get the app.</p>
          <div className="flex justify-center gap-2">
            <a
              href="https://play.google.com/store/apps/details?id=com.instagram.android"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png"
                alt="Get it on Google Play"
                className="h-10"
              />
            </a>
            <a
              href="https://apps.microsoft.com/store/detail/instagram/9nblggh5l9xt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdNX.png"
                alt="Get it from Microsoft"
                className="h-10"
              />
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 mb-3">
            <a href="#" className="hover:underline">Meta</a>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Blog</a>
            <a href="#" className="hover:underline">Jobs</a>
            <a href="#" className="hover:underline">Help</a>
            <a href="#" className="hover:underline">API</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Locations</a>
            <a href="#" className="hover:underline">Instagram Lite</a>
            <a href="#" className="hover:underline">Threads</a>
          </div>
          <div className="text-xs text-gray-500">
            <span>© 2025 Linkly from Meta</span>
          </div>
        </footer>
      </div>
    </div>
  );
}