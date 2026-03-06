import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Award, Mail, Lock, User, ArrowRight, Loader2, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/frontend/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema, signInSchema } from "@/backend/services/auth";

const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                // Client-side validation
                const validation = signUpSchema.safeParse({ email, password, displayName });
                if (!validation.success) {
                    toast({
                        variant: "destructive",
                        title: "Validation Error",
                        description: validation.error.errors[0]?.message || "Invalid input.",
                    });
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email: validation.data.email,
                    password: validation.data.password,
                    options: {
                        data: { display_name: validation.data.displayName },
                        emailRedirectTo: window.location.origin,
                    },
                });
                if (error) throw error;
                toast({
                    title: "Account created",
                    description: "Check your email for the confirmation link.",
                });
            } else {
                const validation = signInSchema.safeParse({ email, password });
                if (!validation.success) {
                    toast({
                        variant: "destructive",
                        title: "Validation Error",
                        description: validation.error.errors[0]?.message || "Invalid input.",
                    });
                    return;
                }

                const { error } = await supabase.auth.signInWithPassword({
                    email: validation.data.email,
                    password: validation.data.password,
                });
                if (error) throw new Error("Invalid email or password.");
                toast({
                    title: "Welcome back!",
                    description: "You have successfully signed in.",
                });
                navigate("/");
            }
        } catch (error: any) {
            // Generic error message to prevent info leakage
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            setGoogleLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error connecting to Google",
                description: error.message,
            });
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
                        <Award className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
                        {isSignUp ? "Create your account" : "Welcome back"}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Explore the history and achievements of Nobel Laureates
                    </p>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="Albert Einstein"
                                        className="pl-10"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required
                                        maxLength={100}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    maxLength={255}
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    maxLength={128}
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                />
                            </div>
                            {isSignUp && (
                                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                            )}
                        </div>

                        <Button className="w-full h-11 bg-primary text-primary-foreground font-semibold" disabled={loading || googleLoading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 flex items-center justify-between">
                        <span className="w-1/5 border-b border-border/50 lg:w-1/4"></span>
                        <span className="text-xs text-center text-muted-foreground uppercase tracking-widest font-bold">or continue with</span>
                        <span className="w-1/5 border-b border-border/50 lg:w-1/4"></span>
                    </div>

                    <div className="mt-6">
                        <Button
                            variant="outline"
                            className="w-full h-11 border-border/50 font-semibold"
                            disabled={loading || googleLoading}
                            onClick={handleGoogleAuth}
                            type="button"
                        >
                            {googleLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Chrome className="mr-2 h-4 w-4" />
                            )}
                            Google
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-primary font-semibold hover:underline"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
