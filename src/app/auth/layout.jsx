import { Poppins, Inter, Fredoka, Roboto } from "next/font/google";
import "../globals.css";

// font setup (sama kayak root)
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-poppins",
});
const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-inter",
});
const fredoka = Fredoka({
    subsets: ["latin"],
    weight: ["700"],
    variable: "--font-fredoka",
});
const roboto = Roboto({
    subsets: ["latin"],
    weight: ["700"],
    variable: "--font-roboto",
});

export const metadata = {
    title: "Mauna - Auth",
    description: "Login atau daftar untuk belajar bahasa isyarat",
};

export default function AuthLayout({ children }) {
    return (
        <div className="bg-[#FAFAFA] font-poppins">
            {children}
        </div>

    );
}