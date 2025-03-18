"use client";
import HorizontalRule from "@/components/horizontal-rule";
import ViewEvents from "@/components/view-events";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {getSession} from "next-auth/react";
import Spinner from "@/components/spinner";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  // Ensure signed in
  useEffect(() => {
    async function fetchSession() {
      const session = await getSession(); // Fetch the session data
      setSession(session); // Update the state with the session
      console.log("USER SESSION", session);

      if (!session) {
        router.push("/signin"); // Redirect if no session
      }
    }
    fetchSession();
  }, [router]);


  if (!session) {
    return <Spinner />;
  }

  return (
    <div className="w-full space-y-4">
  

      <ViewEvents />
      <HorizontalRule />

    </div>
  );
}
