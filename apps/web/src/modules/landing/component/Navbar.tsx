import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <header>
            <div>
                <span>
                    MedixFlow
                </span>

                <nav>
                    <a href="#">About</a>
                    <a href="#">Contact</a>
                </nav>

                <Link to = "/patient/login" className="text-sm">Login</Link>
                <Link to= "/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">Get Started</Link>
            </div>
        </header>
    )
}