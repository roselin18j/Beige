
import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">

            <div className="mx-auto mb-10 max-w-6xl">
                <Link
                    to="/"
                    className=" whitespace-nowrap text-[25px] max-[500px]:text-[18px] max-[400px]:text-[15px] font-serif font-light leading-none tracking-[1px] text-mocha"
                >
                    Beige
                    <span className="mt-[5px] ml-1 block font-sans text-[10px] max-[991px]:text-[8px] tracking-[2px]">
                        YOUR DAILY RITUALS
                    </span>
                </Link>
            </div>

            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="border border-line bg-white p-6 sm:p-10">

                        <div className="mb-8 text-center">
                         <h1 className="font-serif text-4xl max-[1024px]:text-3xl max-[768px]:text-4xl max-[640px]:text-2xl max-[375px]:text-2xl text-ink leading-tight">
    {title}
</h1>

                            <p className="mt-3 text-sm leading-6 text-muted">
                                {subtitle}
                            </p>
                        </div>


                        {children}
                    </div>


                    <p className="mt-6 text-center text-xs tracking-wide text-muted">
                        YOUR DAILY RITUALS
                    </p>
                </div>
            </div>
        </div>
    );
}
