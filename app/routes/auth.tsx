import { useAuthStore } from "~/lib/auth";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => ([
    { title: 'ResumeSense | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isLoading, isAuthenticated, signIn, signUp, signOut, error } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/';
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) navigate(next);
    }, [isAuthenticated, next, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
            await signUp(email, password);
        } else {
            await signIn(email, password);
        }
    };

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>{isSignUp ? 'Create Account' : 'Log In to Continue Your Job Journey'}</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            required
                        />
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <button 
                            type="submit" 
                            className="auth-button"
                            disabled={isLoading}
                        >
                            <p>{isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Log In')}</p>
                        </button>
                    </form>
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-blue-500 hover:underline"
                        >
                            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                    {isAuthenticated && (
                        <button className="auth-button" onClick={signOut}>
                            <p>Log Out</p>
                        </button>
                    )}
                </section>
            </div>
        </main>
    )
}
export default Auth
