import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat, User, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register, useAuth } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign up state
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpUser, setSignUpUser] = useState("");
  const [signUpPass, setSignUpPass] = useState("");
  const [signUpConfirmPass, setSignUpConfirmPass] = useState("");
  const [showSignUpPass, setShowSignUpPass] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (auth.token) nav({ to: "/" });
  }, [auth.token, nav]);

  const doLogin = async (u: string, p: string) => {
    setLoading(true);
    try {
      const ok = await login(u, p);
      setLoading(false);
      if (ok) {
        toast.success("Welcome back to BuildTrack!");
        nav({ to: "/" });
      } else {
        toast.error("Invalid username or password.");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Failed to log in");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return toast.error("Please enter both username and password");
    }
    doLogin(username, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpUser.trim() || !signUpPass.trim()) {
      return toast.error("Please enter a username and password");
    }
    if (signUpPass !== signUpConfirmPass) {
      return toast.error("Passwords do not match");
    }
    if (signUpPass.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    
    setLoading(true);
    try {
      const ok = await register(signUpUser.trim(), signUpPass.trim());
      setLoading(false);
      if (ok) {
        toast.success("Account created successfully!");
        nav({ to: "/" });
      } else {
        toast.error("Failed to create account.");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Failed to create account");
    }
  };

  const useDemo = () => {
    setUsername("admin");
    setPassword("admin123");
    doLogin("admin", "admin123");
  };

  // Password strength check
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", color: "bg-slate-700" };
    if (pass.length < 6) return { label: "Weak", color: "bg-rose-500 w-1/3" };
    if (pass.length < 10) return { label: "Medium", color: "bg-amber-500 w-2/3" };
    return { label: "Strong", color: "bg-emerald-500 w-full" };
  };

  const strength = getPasswordStrength(signUpPass);

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-25%] left-[-25%] w-[800px] h-[800px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Glow border wrap */}
        <div className="p-[1px] rounded-3xl bg-gradient-to-tr from-emerald-500/30 via-slate-800 to-violet-500/30 shadow-2xl">
          <div className="backdrop-blur-xl bg-slate-950/85 p-8 rounded-[23px] flex flex-col">
            
            {/* Header branding */}
            <div className="text-center mb-8">
              <div className="mx-auto size-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-violet-600/20">
                <HardHat className="size-7 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 via-slate-100 to-violet-400 bg-clip-text text-transparent">
                BuildTrack
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                House Construction Expense Tracker
              </p>
            </div>

            {/* Render forms */}
            {!isSignUp ? (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="u" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input 
                      id="u" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      autoComplete="username" 
                      className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500"
                      placeholder="Username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="p" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input 
                      id="p" 
                      type={showPassword ? "text" : "password"}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      autoComplete="current-password" 
                      className="pl-10 pr-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-emerald-500 size-3.5" />
                    <span>Remember this device</span>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium h-11 rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : (
                    <>
                      Sign In <LogIn className="size-4" />
                    </>
                  )}
                </Button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800/80"></div>
                  <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">or use developer mode</span>
                  <div className="flex-grow border-t border-slate-800/80"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-800 hover:bg-slate-900 text-slate-300 font-medium h-11 rounded-xl flex items-center justify-center gap-2"
                  disabled={loading}
                  onClick={useDemo}
                >
                  <Sparkles className="size-4 text-amber-400" /> Use Demo Credentials
                </Button>
                
                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto"
                  >
                    Don't have an account? Create one <ArrowRight className="size-3" />
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 text-center pt-3 border-t border-slate-800/50">
                  Demo User: <span className="font-mono text-slate-400">admin</span> &nbsp;|&nbsp; Password: <span className="font-mono text-slate-400">admin123</span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-800/50 mb-3">
                  <UserPlus className="size-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-slate-200">Create Custom Account</h3>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="su-u" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Choose Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input 
                      id="su-u" 
                      placeholder="Create username" 
                      value={signUpUser} 
                      onChange={(e) => setSignUpUser(e.target.value)} 
                      autoComplete="username" 
                      className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="su-p" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Choose Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input 
                      id="su-p" 
                      type={showSignUpPass ? "text" : "password"} 
                      placeholder="Minimum 6 characters" 
                      value={signUpPass} 
                      onChange={(e) => setSignUpPass(e.target.value)} 
                      autoComplete="new-password" 
                      className="pl-10 pr-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPass(!showSignUpPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showSignUpPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {signUpPass && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-400">Password Strength</span>
                        <span className={
                          strength.label === "Weak" ? "text-rose-400" :
                          strength.label === "Medium" ? "text-amber-400" : "text-emerald-400"
                        }>{strength.label}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="su-cp" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirm Password</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input 
                      id="su-cp" 
                      type={showSignUpPass ? "text" : "password"} 
                      placeholder="Retype your password" 
                      value={signUpConfirmPass} 
                      onChange={(e) => setSignUpConfirmPass(e.target.value)} 
                      autoComplete="new-password" 
                      className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium h-11 rounded-xl shadow-lg shadow-violet-500/10 transition-all flex items-center justify-center gap-2 mt-2"
                  disabled={loading}
                >
                  {loading ? "Creating Account…" : (
                    <>
                      Create & Sign In <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
                
                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}