"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus, LogIn, Lock, Mail, User } from "lucide-react";

interface AuthModalProps {
  trigger: React.ReactNode;
}

export function AuthModal({ trigger }: AuthModalProps) {
  // Toggle between 'signin' and 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: username } // Storing username in metadata
          }
        });
        if (error) throw error;
        alert("Account created! You can now sign in.");
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if(!open) { setError(null); }}}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 rounded-[2rem] shadow-2xl">
        <DialogHeader className="items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xl mb-2">
            N
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {mode === 'signin' ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {mode === 'signin' 
              ? "Sign in to access your saved research." 
              : "Join NoteWave to start organizing your brain."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-4 pt-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              mode === 'signin' ? "Sign In" : "Register"
            )}
          </Button>

          {error && (
            <p className="text-[10px] text-center text-red-500 font-bold uppercase tracking-widest">{error}</p>
          )}
        </form>

        <div className="pt-4 text-center">
          <button 
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors underline underline-offset-4"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}