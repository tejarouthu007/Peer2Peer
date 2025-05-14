"use client";

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [displayname, setDisplayname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await signUp(email, password, displayname);
      router.push("/auth/signin"); 
    } catch (err: any) {
      setError("Error signing up. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSignUp} className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl mb-4 text-center">Sign Up</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="displayname" className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <input
            id="displayname"
            type="text"
            value={displayname}
            onChange={(e) => setDisplayname(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded-md">
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
